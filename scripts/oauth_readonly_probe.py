#!/usr/bin/env python3
"""Run a one-shot, in-memory OAuth U2M audit against a Databricks workspace.

The access and refresh tokens are never printed or written to disk. The process
exits after a small set of read-only API calls.
"""

from __future__ import annotations

import argparse
import base64
import collections
import hashlib
import http.server
import json
from pathlib import Path
import secrets
import socketserver
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


CLIENT_ID = "databricks-cli"
SCOPES = "all-apis offline_access"
STANDARD_CATALOGS = {"samples", "system"}


def workspace_host(value: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or not parsed.hostname.endswith(".databricks.com")
        or parsed.username
        or parsed.password
    ):
        raise argparse.ArgumentTypeError("host must be an HTTPS Databricks workspace URL")
    return urllib.parse.urlunsplit(("https", parsed.netloc, "", "", ""))


def random_pkce_value(length: int = 64) -> str:
    alphabet = string.ascii_letters + string.digits + "-._~"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def http_json(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    data: bytes | None = None,
    timeout: int = 30,
) -> tuple[int, object]:
    request = urllib.request.Request(url, method=method, headers=headers or {}, data=data)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read()
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as error:
        body = error.read()
        try:
            parsed: object = json.loads(body) if body else {}
        except json.JSONDecodeError:
            parsed = {"error_type": "non_json_response"}
        return error.code, parsed


def counter(items: list[object], field: str) -> dict[str, int]:
    values: collections.Counter[str] = collections.Counter()
    for item in items:
        if isinstance(item, dict):
            value = item.get(field)
            if isinstance(value, str) and value:
                values[value] += 1
    return dict(sorted(values.items()))


def list_from(payload: object, candidates: tuple[str, ...]) -> list[object]:
    if not isinstance(payload, dict):
        return []
    for key in candidates:
        value = payload.get(key)
        if isinstance(value, list):
            return value
    return []


def safe_error(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        return {"response_type": type(payload).__name__}
    result: dict[str, object] = {"top_level_keys": sorted(payload.keys())}
    error_code = payload.get("error_code") or payload.get("error")
    if isinstance(error_code, str):
        result["error_code"] = error_code
    return result


def probe_api(host: str, access_token: str) -> dict[str, object]:
    headers = {"Authorization": f"Bearer {access_token}", "Accept": "application/json"}

    def get(path: str) -> tuple[int, object]:
        return http_json(host + path, headers=headers)

    result: dict[str, object] = {
        "authenticated": False,
        "token_persisted": False,
        "checks": {},
    }
    checks: dict[str, object] = result["checks"]  # type: ignore[assignment]

    status, payload = get("/api/2.0/preview/scim/v2/Me")
    result["authenticated"] = status == 200
    identity: dict[str, object] = {"http_status": status, "identity_values_recorded": False}
    if isinstance(payload, dict):
        entitlements = payload.get("entitlements")
        roles = payload.get("roles")
        identity["active"] = payload.get("active") if isinstance(payload.get("active"), bool) else None
        identity["entitlement_count"] = len(entitlements) if isinstance(entitlements, list) else 0
        identity["role_count"] = len(roles) if isinstance(roles, list) else 0
    if status != 200:
        identity.update(safe_error(payload))
    checks["identity"] = identity

    status, payload = get("/api/2.1/unity-catalog/catalogs?max_results=100")
    catalogs = list_from(payload, ("catalogs",))
    catalog_names = {
        item.get("name")
        for item in catalogs
        if isinstance(item, dict) and isinstance(item.get("name"), str)
    }
    catalog_check: dict[str, object] = {
        "http_status": status,
        "count": len(catalogs),
        "has_samples": "samples" in catalog_names,
        "has_system": "system" in catalog_names,
        "nonstandard_count": len(catalog_names - STANDARD_CATALOGS),
        "nonstandard_names_recorded": False,
    }
    if status != 200:
        catalog_check.update(safe_error(payload))
    checks["catalogs"] = catalog_check

    endpoint_specs = (
        ("warehouses", "/api/2.0/sql/warehouses", ("warehouses",), ("state", "cluster_size", "warehouse_type")),
        ("workspace_root", "/api/2.0/workspace/list?path=%2F", ("objects",), ("object_type",)),
        ("clusters", "/api/2.0/clusters/list", ("clusters",), ("state", "cluster_source")),
        ("jobs", "/api/2.1/jobs/list?limit=25", ("jobs",), ()),
        ("pipelines", "/api/2.0/pipelines?max_results=25", ("statuses",), ("state",)),
        ("apps", "/api/2.0/apps", ("apps",), ("status", "compute_status")),
        ("genie_spaces", "/api/2.0/genie/spaces?page_size=25", ("spaces",), ()),
        ("lakebase_projects", "/api/2.0/database/projects", ("database_projects", "projects"), ("status",)),
    )
    for name, path, list_keys, count_fields in endpoint_specs:
        status, payload = get(path)
        items = list_from(payload, list_keys)
        item: dict[str, object] = {"http_status": status, "count": len(items)}
        if isinstance(payload, dict) and isinstance(payload.get("has_more"), bool):
            item["has_more"] = payload["has_more"]
        for field in count_fields:
            counts = counter(items, field)
            if counts:
                item[field + "_counts"] = counts
        if status != 200:
            item.update(safe_error(payload))
        checks[name] = item

    return result


def sample_query(host: str, access_token: str) -> dict[str, object]:
    """Run one aggregate query over public sample data and restore compute state."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    status, payload = http_json(host + "/api/2.0/sql/warehouses", headers=headers)
    warehouses = list_from(payload, ("warehouses",))
    if status != 200 or len(warehouses) != 1 or not isinstance(warehouses[0], dict):
        return {
            "attempted": False,
            "reason": "expected_exactly_one_warehouse",
            "warehouse_http_status": status,
            "warehouse_count": len(warehouses),
        }
    warehouse = warehouses[0]
    warehouse_id = warehouse.get("id")
    initial_state = warehouse.get("state")
    if not isinstance(warehouse_id, str):
        return {"attempted": False, "reason": "warehouse_id_missing"}

    started_by_probe = False
    transitions: list[str] = [str(initial_state)] if isinstance(initial_state, str) else []

    def warehouse_state() -> tuple[int, str | None]:
        detail_status, detail = http_json(
            host + "/api/2.0/sql/warehouses/" + urllib.parse.quote(warehouse_id, safe=""),
            headers=headers,
        )
        state = detail.get("state") if isinstance(detail, dict) else None
        return detail_status, state if isinstance(state, str) else None

    def wait_for_state(targets: set[str], timeout_seconds: int) -> tuple[int, str | None]:
        deadline = time.monotonic() + timeout_seconds
        latest_status = 0
        latest_state: str | None = None
        while time.monotonic() < deadline:
            latest_status, latest_state = warehouse_state()
            if latest_state and (not transitions or transitions[-1] != latest_state):
                transitions.append(latest_state)
                print("WAREHOUSE_STATE=" + latest_state, flush=True)
            if latest_state in targets:
                return latest_status, latest_state
            time.sleep(3)
        return latest_status, latest_state

    result: dict[str, object] = {
        "attempted": True,
        "statement": "SELECT COUNT(*) AS trip_count FROM samples.nyctaxi.trips",
        "initial_warehouse_state": initial_state,
        "warehouse_identifier_recorded": False,
    }
    try:
        if initial_state == "STOPPED":
            start_status, start_payload = http_json(
                host + "/api/2.0/sql/warehouses/" + urllib.parse.quote(warehouse_id, safe="") + "/start",
                method="POST",
                headers=headers,
                data=b"{}",
            )
            result["warehouse_start_http_status"] = start_status
            if start_status not in (200, 202):
                result["warehouse_start_error"] = safe_error(start_payload)
                return result
            started_by_probe = True
            print("WAREHOUSE_START_REQUEST=accepted", flush=True)
            _, ready_state = wait_for_state({"RUNNING"}, 420)
            if ready_state != "RUNNING":
                result["query_state"] = "warehouse_start_timeout"
                return result
        elif initial_state != "RUNNING":
            result["query_state"] = "warehouse_not_ready"
            return result

        statement_body = json.dumps(
            {
                "warehouse_id": warehouse_id,
                "statement": result["statement"],
                "wait_timeout": "50s",
                "on_wait_timeout": "CONTINUE",
                "disposition": "INLINE",
                "format": "JSON_ARRAY",
            }
        ).encode()
        statement_status, statement_payload = http_json(
            host + "/api/2.0/sql/statements/",
            method="POST",
            headers=headers,
            data=statement_body,
            timeout=70,
        )
        result["statement_http_status"] = statement_status
        if statement_status != 200 or not isinstance(statement_payload, dict):
            result["query_state"] = "submission_failed"
            result["statement_error"] = safe_error(statement_payload)
            return result
        statement_id = statement_payload.get("statement_id")
        if not isinstance(statement_id, str):
            result["query_state"] = "missing_statement_id"
            return result

        final_payload = statement_payload
        deadline = time.monotonic() + 420
        while time.monotonic() < deadline:
            status_block = final_payload.get("status") if isinstance(final_payload, dict) else None
            query_state = status_block.get("state") if isinstance(status_block, dict) else None
            if query_state in {"SUCCEEDED", "FAILED", "CANCELED", "CLOSED"}:
                break
            time.sleep(2)
            _, final_payload = http_json(
                host + "/api/2.0/sql/statements/" + urllib.parse.quote(statement_id, safe=""),
                headers=headers,
            )
        status_block = final_payload.get("status") if isinstance(final_payload, dict) else None
        query_state = status_block.get("state") if isinstance(status_block, dict) else "UNKNOWN"
        result["query_state"] = query_state
        result["statement_identifier_recorded"] = False
        if query_state == "SUCCEEDED" and isinstance(final_payload, dict):
            data_block = final_payload.get("result")
            data_rows = data_block.get("data_array") if isinstance(data_block, dict) else None
            value = None
            if isinstance(data_rows, list) and data_rows and isinstance(data_rows[0], list) and data_rows[0]:
                value = data_rows[0][0]
            if isinstance(value, (str, int)):
                result["trip_count"] = int(value)
        elif isinstance(status_block, dict):
            error = status_block.get("error")
            result["query_error"] = safe_error(error)
        return result
    finally:
        result["warehouse_started_by_probe"] = started_by_probe
        if started_by_probe:
            stop_status, stop_payload = http_json(
                host + "/api/2.0/sql/warehouses/" + urllib.parse.quote(warehouse_id, safe="") + "/stop",
                method="POST",
                headers=headers,
                data=b"{}",
            )
            result["warehouse_stop_http_status"] = stop_status
            if stop_status not in (200, 202):
                result["warehouse_stop_error"] = safe_error(stop_payload)
            else:
                print("WAREHOUSE_STOP_REQUEST=accepted", flush=True)
                _, final_state = wait_for_state({"STOPPED"}, 180)
                result["final_warehouse_state"] = final_state
        result["warehouse_state_transitions"] = transitions


def hold_control_session(host: str, access_token: str, minutes: int) -> None:
    """Hold the access token in memory behind a mode-0600 local Unix socket."""
    socket_path = Path("/tmp/databricks-explore-oauth.sock")
    if socket_path.exists():
        print("SESSION_BROKER=refused_existing_socket", flush=True)
        return
    session_state = {"stop": False}

    class SessionHandler(socketserver.StreamRequestHandler):
        def handle(self) -> None:
            line = self.rfile.readline(4096)
            try:
                request = json.loads(line)
            except (json.JSONDecodeError, UnicodeDecodeError):
                response: object = {"status": "error", "reason": "invalid_json"}
            else:
                action = request.get("action") if isinstance(request, dict) else None
                if action == "status":
                    response = {
                        "status": "ready",
                        "token_persisted": False,
                        "arbitrary_sql_allowed": False,
                    }
                elif action == "readonly_probe":
                    response = probe_api(host, access_token)
                elif action == "feature_probe":
                    from databricks_consolidated import feature_probe

                    response = feature_probe(host, access_token)
                elif action == "genie_probe":
                    from databricks_consolidated import genie_demo_probe

                    response = genie_demo_probe(host, access_token)
                elif action == "shutdown":
                    session_state["stop"] = True
                    response = {"status": "shutting_down", "token_persisted": False}
                else:
                    response = {"status": "error", "reason": "unsupported_action"}
            self.wfile.write((json.dumps(response, ensure_ascii=False, sort_keys=True) + "\n").encode())

    class SessionServer(socketserver.UnixStreamServer):
        allow_reuse_address = False

    server = SessionServer(str(socket_path), SessionHandler)
    socket_path.chmod(0o600)
    server.timeout = 1
    deadline = time.monotonic() + max(1, minutes) * 60
    print("SESSION_BROKER=ready", flush=True)
    print("SESSION_SOCKET=/tmp/databricks-explore-oauth.sock", flush=True)
    print("SESSION_MINUTES=" + str(minutes), flush=True)
    try:
        while not session_state["stop"] and time.monotonic() < deadline:
            server.handle_request()
    finally:
        server.server_close()
        if socket_path.exists():
            socket_path.unlink()
        print("SESSION_BROKER=closed", flush=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", required=True, type=workspace_host)
    parser.add_argument("--port", type=int, default=8020)
    parser.add_argument("--timeout", type=int, default=600)
    parser.add_argument(
        "--run-sample-query",
        action="store_true",
        help="Start the sole stopped warehouse, run one aggregate over samples, then stop it",
    )
    parser.add_argument(
        "--seed-demo-data",
        action="store_true",
        help="Create an isolated demo schema, volume, Delta tables, and views from local synthetic CSV files",
    )
    parser.add_argument(
        "--consolidated-evaluation",
        action="store_true",
        help="Run all trusted case baselines, feature probes, and import the demo notebook",
    )
    parser.add_argument(
        "--hold-session-minutes",
        type=int,
        default=0,
        help="Keep the token only in memory behind a local mode-0600 control socket",
    )
    args = parser.parse_args()

    verifier = random_pkce_value()
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).decode().rstrip("=")
    state = secrets.token_urlsafe(24)
    redirect_uri = f"http://localhost:{args.port}"
    authorize_query = urllib.parse.urlencode(
        {
            "client_id": CLIENT_ID,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
            "scope": SCOPES,
        }
    )
    authorize_url = f"{args.host}/oidc/v1/authorize?{authorize_query}"
    callback: dict[str, str] = {}

    class CallbackHandler(http.server.BaseHTTPRequestHandler):
        def do_GET(self) -> None:  # noqa: N802
            parsed = urllib.parse.urlsplit(self.path)
            values = urllib.parse.parse_qs(parsed.query)
            callback["state"] = values.get("state", [""])[0]
            callback["code"] = values.get("code", [""])[0]
            callback["error"] = values.get("error", [""])[0]
            body = (
                "<!doctype html><meta charset='utf-8'>"
                "<title>Databricks authorization received</title>"
                "<h1>授权结果已送回本地探针</h1>"
                "<p>可以关闭此页面并返回演示任务。页面不会显示或保存授权码。</p>"
            ).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def log_message(self, _format: str, *_args: object) -> None:
            return

    server = http.server.HTTPServer(("127.0.0.1", args.port), CallbackHandler)
    server.timeout = args.timeout
    print("OAUTH_URL=" + authorize_url, flush=True)
    print("OAUTH_STORAGE=in-memory-only", flush=True)
    server.handle_request()
    server.server_close()

    if callback.get("error"):
        print("OAUTH_RESULT=authorization_error", flush=True)
        return 2
    if not callback.get("code"):
        print("OAUTH_RESULT=timeout_or_missing_code", flush=True)
        return 3
    if not secrets.compare_digest(callback.get("state", ""), state):
        print("OAUTH_RESULT=state_mismatch", flush=True)
        return 4

    token_data = urllib.parse.urlencode(
        {
            "client_id": CLIENT_ID,
            "grant_type": "authorization_code",
            "scope": SCOPES,
            "redirect_uri": redirect_uri,
            "code_verifier": verifier,
            "code": callback["code"],
        }
    ).encode()
    status, token_payload = http_json(
        f"{args.host}/oidc/v1/token",
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
        data=token_data,
    )
    if status != 200 or not isinstance(token_payload, dict) or not isinstance(token_payload.get("access_token"), str):
        print("OAUTH_RESULT=token_exchange_failed", flush=True)
        print("OAUTH_TOKEN_HTTP_STATUS=" + str(status), flush=True)
        return 5

    access_token = token_payload["access_token"]
    result = probe_api(args.host, access_token)
    if args.run_sample_query and result.get("authenticated"):
        result["sample_query"] = sample_query(args.host, access_token)
    if args.seed_demo_data and result.get("authenticated"):
        from databricks_seed import seed_demo_data

        data_directory = Path(__file__).resolve().parent.parent / "data" / "synthetic"
        result["demo_seed"] = seed_demo_data(args.host, access_token, data_directory)
    if args.consolidated_evaluation and result.get("authenticated"):
        from databricks_consolidated import consolidated_evaluation

        workspace_root = Path(__file__).resolve().parent.parent
        result["consolidated_evaluation"] = consolidated_evaluation(
            args.host, access_token, workspace_root
        )
    print("OAUTH_RESULT=success", flush=True)
    print("READONLY_PROBE=" + json.dumps(result, ensure_ascii=False, sort_keys=True), flush=True)
    if args.hold_session_minutes > 0 and result.get("authenticated"):
        hold_control_session(args.host, access_token, args.hold_session_minutes)
    return 0 if result.get("authenticated") else 6


if __name__ == "__main__":
    sys.exit(main())
