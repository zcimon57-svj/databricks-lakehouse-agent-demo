"""Seed the Databricks demo schema through an in-memory OAuth access token."""

from __future__ import annotations

import collections
import json
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request


TARGET_SCHEMA = "dbx_demo_20260814"
TARGET_VOLUME = "seed_files"
STANDARD_CATALOGS = {"samples", "system", "hive_metastore"}

TABLES: dict[str, tuple[str, str]] = {
    "customers": (
        "customer_id STRING, customer_name STRING, email STRING, segment STRING, region STRING, signup_date DATE, is_vip BOOLEAN",
        "Synthetic customers for after-sales analysis; all identities and emails are fictional.",
    ),
    "products": (
        "product_id STRING, product_name STRING, category STRING, unit_price DECIMAL(12,2), warranty_days INT, active BOOLEAN",
        "Synthetic product catalog with price and warranty attributes.",
    ),
    "orders": (
        "order_id STRING, customer_id STRING, order_ts TIMESTAMP, channel STRING, status STRING, region STRING, payment_method STRING, total_amount DECIMAL(14,2)",
        "Synthetic customer orders used for sales and after-sales analysis.",
    ),
    "order_items": (
        "order_item_id STRING, order_id STRING, product_id STRING, quantity INT, unit_price DECIMAL(12,2), discount_pct DOUBLE, line_amount DECIMAL(14,2)",
        "Synthetic order lines joining orders and products.",
    ),
    "refunds": (
        "refund_id STRING, order_id STRING, requested_ts TIMESTAMP, completed_ts TIMESTAMP, reason STRING, status STRING, amount DECIMAL(14,2)",
        "Synthetic refund requests and outcomes; no real financial records.",
    ),
    "support_tickets": (
        "ticket_id STRING, customer_id STRING, order_id STRING, created_ts TIMESTAMP, category STRING, priority STRING, channel STRING, sentiment STRING, status STRING, resolution_minutes INT, summary STRING",
        "Synthetic support tickets for natural-language and intelligent after-sales demonstrations.",
    ),
    "support_policies": (
        "policy_id STRING, title STRING, category STRING, effective_date DATE, content STRING, approval_required BOOLEAN",
        "Synthetic support policies that define approval boundaries for suggested actions.",
    ),
    "db_instances": (
        "instance_id STRING, instance_name STRING, engine STRING, version STRING, region STRING, service_tier STRING, owner_team STRING, cpu_cores INT, memory_gb INT, production BOOLEAN",
        "Synthetic database inventory; host names and ownership are fictional.",
    ),
    "db_metrics": (
        "instance_id STRING, observed_ts TIMESTAMP, cpu_pct DOUBLE, memory_pct DOUBLE, qps DOUBLE, p95_latency_ms DOUBLE, active_connections INT, lock_waits INT, error_rate DOUBLE",
        "Synthetic database telemetry with deterministic incident signatures.",
    ),
    "slow_queries": (
        "query_id STRING, instance_id STRING, observed_ts TIMESTAMP, query_fingerprint STRING, duration_ms BIGINT, rows_examined BIGINT, rows_returned BIGINT, query_type STRING, wait_event STRING",
        "Synthetic slow-query observations; fingerprints contain no production SQL.",
    ),
    "alerts": (
        "alert_id STRING, instance_id STRING, fired_ts TIMESTAMP, severity STRING, metric STRING, threshold DOUBLE, observed_value DOUBLE, status STRING",
        "Synthetic database alerts for incident correlation.",
    ),
    "changes": (
        "change_id STRING, instance_id STRING, changed_ts TIMESTAMP, change_type STRING, description STRING, operator STRING, approved BOOLEAN",
        "Synthetic database change records for causal analysis.",
    ),
    "incidents": (
        "incident_id STRING, instance_id STRING, started_ts TIMESTAMP, ended_ts TIMESTAMP, severity STRING, symptom STRING, root_cause STRING, resolution STRING, status STRING",
        "Three deterministic synthetic incidents used as evaluation ground truth.",
    ),
    "runbooks": (
        "runbook_id STRING, title STRING, symptom_pattern STRING, diagnostic_steps STRING, safe_actions STRING, prohibited_actions STRING, approval_required BOOLEAN",
        "Synthetic runbooks separating safe diagnostics from prohibited automatic remediation.",
    ),
}


class SeedFailure(RuntimeError):
    def __init__(self, stage: str, details: object):
        super().__init__(stage)
        self.stage = stage
        self.details = details


def request_json(
    url: str,
    *,
    method: str = "GET",
    headers: dict[str, str] | None = None,
    data: bytes | None = None,
    timeout: int = 90,
) -> tuple[int, object]:
    request = urllib.request.Request(url, method=method, headers=headers or {}, data=data)
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = response.read()
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as error:
        body = error.read()
        try:
            payload: object = json.loads(body) if body else {}
        except json.JSONDecodeError:
            payload = {"error_type": "non_json_response"}
        return error.code, payload


def error_summary(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        return {"response_type": type(payload).__name__}
    summary: dict[str, object] = {"top_level_keys": sorted(payload.keys())}
    code = payload.get("error_code") or payload.get("error")
    if isinstance(code, str):
        summary["error_code"] = code
    status = payload.get("status")
    if isinstance(status, dict):
        error = status.get("error")
        if isinstance(error, dict) and isinstance(error.get("error_code"), str):
            summary["error_code"] = error["error_code"]
    return summary


def ident(value: str) -> str:
    return "`" + value.replace("`", "``") + "`"


def literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def path_segment(value: str) -> str:
    return urllib.parse.quote(value, safe="")


def execute_sql(host: str, headers: dict[str, str], warehouse_id: str, statement: str) -> list[list[object]]:
    body = json.dumps(
        {
            "warehouse_id": warehouse_id,
            "statement": statement,
            "wait_timeout": "50s",
            "on_wait_timeout": "CONTINUE",
            "disposition": "INLINE",
            "format": "JSON_ARRAY",
        }
    ).encode()
    status, payload = request_json(
        host + "/api/2.0/sql/statements/",
        method="POST",
        headers=headers,
        data=body,
        timeout=70,
    )
    if status != 200 or not isinstance(payload, dict):
        raise SeedFailure("statement_submission", {"http_status": status, **error_summary(payload)})
    statement_id = payload.get("statement_id")
    if not isinstance(statement_id, str):
        raise SeedFailure("statement_identifier", {"http_status": status})
    final = payload
    deadline = time.monotonic() + 600
    while time.monotonic() < deadline:
        status_block = final.get("status") if isinstance(final, dict) else None
        state = status_block.get("state") if isinstance(status_block, dict) else None
        if state in {"SUCCEEDED", "FAILED", "CANCELED", "CLOSED"}:
            break
        time.sleep(2)
        _, final = request_json(
            host + "/api/2.0/sql/statements/" + path_segment(statement_id),
            headers=headers,
        )
    status_block = final.get("status") if isinstance(final, dict) else None
    state = status_block.get("state") if isinstance(status_block, dict) else None
    if state != "SUCCEEDED":
        raise SeedFailure("statement_execution", {"state": state, **error_summary(final)})
    result = final.get("result") if isinstance(final, dict) else None
    rows = result.get("data_array") if isinstance(result, dict) else None
    return rows if isinstance(rows, list) else []


def warehouse_state(host: str, headers: dict[str, str], warehouse_id: str) -> tuple[int, str | None]:
    status, payload = request_json(
        host + "/api/2.0/sql/warehouses/" + path_segment(warehouse_id),
        headers=headers,
    )
    state = payload.get("state") if isinstance(payload, dict) else None
    return status, state if isinstance(state, str) else None


def wait_warehouse(
    host: str,
    headers: dict[str, str],
    warehouse_id: str,
    targets: set[str],
    timeout_seconds: int,
    transitions: list[str],
) -> str | None:
    deadline = time.monotonic() + timeout_seconds
    latest: str | None = None
    while time.monotonic() < deadline:
        _, latest = warehouse_state(host, headers, warehouse_id)
        if latest and (not transitions or transitions[-1] != latest):
            transitions.append(latest)
            print("SEED_WAREHOUSE_STATE=" + latest, flush=True)
        if latest in targets:
            return latest
        time.sleep(3)
    return latest


def seed_demo_data(host: str, access_token: str, data_directory: Path) -> dict[str, object]:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }
    result: dict[str, object] = {
        "target_schema": TARGET_SCHEMA,
        "target_volume": TARGET_VOLUME,
        "catalog_identifier_recorded": False,
        "token_persisted": False,
        "rollback_policy": "drop_only_schema_created_by_this_run_on_failure",
    }

    manifest_path = data_directory / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    datasets = manifest.get("datasets") if isinstance(manifest, dict) else None
    if not isinstance(datasets, dict) or set(datasets) != set(TABLES):
        raise SeedFailure("local_manifest", {"expected_tables": len(TABLES)})
    expected_rows = {
        name: int(meta["rows"])
        for name, meta in datasets.items()
        if isinstance(meta, dict) and isinstance(meta.get("rows"), int)
    }

    status, catalog_payload = request_json(host + "/api/2.1/unity-catalog/catalogs?max_results=100", headers=headers)
    catalog_items = catalog_payload.get("catalogs") if isinstance(catalog_payload, dict) else None
    if status != 200 or not isinstance(catalog_items, list):
        raise SeedFailure("catalog_discovery", {"http_status": status, **error_summary(catalog_payload)})
    candidates = [
        item
        for item in catalog_items
        if isinstance(item, dict)
        and isinstance(item.get("name"), str)
        and item["name"] not in STANDARD_CATALOGS
        and item.get("catalog_type") not in {"SYSTEM_CATALOG", "DELTASHARING_CATALOG", "FOREIGN_CATALOG"}
    ]
    if len(candidates) != 1:
        raise SeedFailure("target_catalog_selection", {"candidate_count": len(candidates)})
    catalog_name = candidates[0]["name"]

    schema_query = urllib.parse.urlencode({"catalog_name": catalog_name, "max_results": 100})
    status, schema_payload = request_json(
        host + "/api/2.1/unity-catalog/schemas?" + schema_query,
        headers=headers,
    )
    schemas = schema_payload.get("schemas") if isinstance(schema_payload, dict) else None
    if status != 200 or not isinstance(schemas, list):
        raise SeedFailure("schema_discovery", {"http_status": status, **error_summary(schema_payload)})
    if any(isinstance(item, dict) and item.get("name") == TARGET_SCHEMA for item in schemas):
        raise SeedFailure("preexisting_target_schema", {"writes_performed": False})

    status, warehouse_payload = request_json(host + "/api/2.0/sql/warehouses", headers=headers)
    warehouses = warehouse_payload.get("warehouses") if isinstance(warehouse_payload, dict) else None
    if status != 200 or not isinstance(warehouses, list) or len(warehouses) != 1 or not isinstance(warehouses[0], dict):
        raise SeedFailure(
            "warehouse_selection",
            {"http_status": status, "warehouse_count": len(warehouses) if isinstance(warehouses, list) else None},
        )
    warehouse_id = warehouses[0].get("id")
    initial_state = warehouses[0].get("state")
    if not isinstance(warehouse_id, str) or not isinstance(initial_state, str):
        raise SeedFailure("warehouse_metadata", {})
    transitions = [initial_state]
    started_by_seed = False
    schema_created = False
    rollback: dict[str, object] = {"attempted": False}

    catalog_sql = ident(catalog_name)
    schema_sql = ident(TARGET_SCHEMA)
    volume_sql = ident(TARGET_VOLUME)
    full_schema = catalog_sql + "." + schema_sql
    volume_path = f"/Volumes/{catalog_name}/{TARGET_SCHEMA}/{TARGET_VOLUME}"

    try:
        if initial_state == "STOPPED":
            start_status, start_payload = request_json(
                host + "/api/2.0/sql/warehouses/" + path_segment(warehouse_id) + "/start",
                method="POST",
                headers=headers,
                data=b"{}",
            )
            if start_status not in (200, 202):
                raise SeedFailure("warehouse_start", {"http_status": start_status, **error_summary(start_payload)})
            started_by_seed = True
            print("SEED_WAREHOUSE_START=accepted", flush=True)
            if wait_warehouse(host, headers, warehouse_id, {"RUNNING"}, 420, transitions) != "RUNNING":
                raise SeedFailure("warehouse_start_timeout", {"transitions": transitions})
        elif initial_state != "RUNNING":
            raise SeedFailure("warehouse_not_ready", {"initial_state": initial_state})

        execute_sql(
            host,
            headers,
            warehouse_id,
            f"CREATE SCHEMA {full_schema} COMMENT 'Synthetic, non-sensitive Databricks data and database demonstration created 2026-08-14'",
        )
        schema_created = True
        print("SEED_SCHEMA_CREATED=true", flush=True)
        execute_sql(
            host,
            headers,
            warehouse_id,
            f"CREATE VOLUME {full_schema}.{volume_sql} COMMENT 'CSV source files for the synthetic Databricks demonstration'",
        )
        print("SEED_VOLUME_CREATED=true", flush=True)

        uploaded_bytes = 0
        uploaded_files = 0
        for table_name in TABLES:
            csv_path = data_directory / f"{table_name}.csv"
            data = csv_path.read_bytes()
            upload_headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
                "Content-Type": "application/octet-stream",
            }
            upload_url = (
                host
                + "/api/2.0/fs/files/Volumes/"
                + "/".join(path_segment(part) for part in (catalog_name, TARGET_SCHEMA, TARGET_VOLUME, csv_path.name))
                + "?overwrite=true"
            )
            upload_status, upload_payload = request_json(
                upload_url,
                method="PUT",
                headers=upload_headers,
                data=data,
                timeout=120,
            )
            if upload_status not in (200, 201, 204):
                raise SeedFailure(
                    "file_upload",
                    {"file": csv_path.name, "http_status": upload_status, **error_summary(upload_payload)},
                )
            uploaded_files += 1
            uploaded_bytes += len(data)
            print(f"SEED_FILE_UPLOADED={uploaded_files}/{len(TABLES)}", flush=True)
        result["uploaded_files"] = uploaded_files
        result["uploaded_bytes"] = uploaded_bytes

        for index, (table_name, (schema_ddl, comment)) in enumerate(TABLES.items(), start=1):
            table_sql = full_schema + "." + ident(table_name)
            source_path = volume_path + "/" + table_name + ".csv"
            execute_sql(
                host,
                headers,
                warehouse_id,
                f"CREATE TABLE {table_sql} USING DELTA AS "
                f"SELECT * FROM read_files({literal(source_path)}, format => 'csv', header => true, "
                f"schema => {literal(schema_ddl)}, schemaEvolutionMode => 'none')",
            )
            execute_sql(
                host,
                headers,
                warehouse_id,
                f"COMMENT ON TABLE {table_sql} IS {literal(comment)}",
            )
            print(f"SEED_DELTA_TABLE_CREATED={index}/{len(TABLES)}", flush=True)

        after_sales_view = full_schema + "." + ident("after_sales_cases")
        execute_sql(
            host,
            headers,
            warehouse_id,
            f"CREATE VIEW {after_sales_view} AS "
            f"SELECT t.ticket_id, t.created_ts, t.category, t.priority, t.sentiment, t.status AS ticket_status, "
            f"t.resolution_minutes, t.summary, c.customer_id, c.customer_name, c.segment, c.region AS customer_region, "
            f"c.is_vip, o.order_id, o.order_ts, o.status AS order_status, o.total_amount, "
            f"COALESCE(r.status, 'NO_REFUND') AS refund_status, r.amount AS refund_amount "
            f"FROM {full_schema}.`support_tickets` t "
            f"JOIN {full_schema}.`customers` c ON t.customer_id = c.customer_id "
            f"LEFT JOIN {full_schema}.`orders` o ON t.order_id = o.order_id "
            f"LEFT JOIN {full_schema}.`refunds` r ON o.order_id = r.order_id",
        )
        daily_sales_view = full_schema + "." + ident("daily_sales")
        execute_sql(
            host,
            headers,
            warehouse_id,
            f"CREATE VIEW {daily_sales_view} AS "
            f"SELECT DATE(order_ts) AS order_date, region, channel, status, COUNT(*) AS order_count, "
            f"SUM(total_amount) AS revenue FROM {full_schema}.`orders` "
            f"GROUP BY DATE(order_ts), region, channel, status",
        )
        dbops_view = full_schema + "." + ident("dbops_incident_context")
        execute_sql(
            host,
            headers,
            warehouse_id,
            f"CREATE VIEW {dbops_view} AS "
            f"SELECT i.incident_id, i.instance_id, d.instance_name, d.engine, d.service_tier, i.started_ts, i.ended_ts, "
            f"i.severity, i.symptom, i.root_cause, i.resolution, i.status, "
            f"COUNT(DISTINCT a.alert_id) AS nearby_alert_count, COUNT(DISTINCT c.change_id) AS nearby_change_count "
            f"FROM {full_schema}.`incidents` i JOIN {full_schema}.`db_instances` d ON i.instance_id = d.instance_id "
            f"LEFT JOIN {full_schema}.`alerts` a ON i.instance_id = a.instance_id "
            f"AND a.fired_ts BETWEEN i.started_ts - INTERVAL 2 HOURS AND COALESCE(i.ended_ts, current_timestamp()) + INTERVAL 1 HOUR "
            f"LEFT JOIN {full_schema}.`changes` c ON i.instance_id = c.instance_id "
            f"AND c.changed_ts BETWEEN i.started_ts - INTERVAL 4 HOURS AND COALESCE(i.ended_ts, current_timestamp()) + INTERVAL 1 HOUR "
            f"GROUP BY i.incident_id, i.instance_id, d.instance_name, d.engine, d.service_tier, i.started_ts, i.ended_ts, "
            f"i.severity, i.symptom, i.root_cause, i.resolution, i.status",
        )
        print("SEED_VIEWS_CREATED=3", flush=True)

        union_sql = " UNION ALL ".join(
            f"SELECT {literal(name)} AS table_name, COUNT(*) AS row_count FROM {full_schema}.{ident(name)}"
            for name in TABLES
        )
        rows = execute_sql(host, headers, warehouse_id, union_sql)
        actual_rows = {
            str(row[0]): int(row[1])
            for row in rows
            if isinstance(row, list) and len(row) >= 2
        }
        mismatches = {
            name: {"expected": expected_rows.get(name), "actual": actual_rows.get(name)}
            for name in TABLES
            if actual_rows.get(name) != expected_rows.get(name)
        }
        result["table_count"] = len(actual_rows)
        result["total_rows"] = sum(actual_rows.values())
        result["row_count_validation"] = "PASS" if not mismatches else "FAIL"
        if mismatches:
            result["row_count_mismatches"] = mismatches
            raise SeedFailure("row_count_validation", mismatches)

        incident_rows = execute_sql(
            host,
            headers,
            warehouse_id,
            f"SELECT COUNT(*) FROM {dbops_view}",
        )
        result["dbops_incident_context_count"] = int(incident_rows[0][0]) if incident_rows else None
        after_sales_rows = execute_sql(
            host,
            headers,
            warehouse_id,
            f"SELECT COUNT(*) FROM {after_sales_view}",
        )
        result["after_sales_case_count"] = int(after_sales_rows[0][0]) if after_sales_rows else None
        result["view_count"] = 3
        result["status"] = "success"
    except SeedFailure as error:
        result["status"] = "failed"
        result["failure_stage"] = error.stage
        result["failure_details"] = error.details
        if schema_created:
            rollback["attempted"] = True
            try:
                execute_sql(host, headers, warehouse_id, f"DROP SCHEMA {full_schema} CASCADE")
                rollback["status"] = "success"
            except SeedFailure as rollback_error:
                rollback["status"] = "failed"
                rollback["failure_stage"] = rollback_error.stage
                rollback["failure_details"] = rollback_error.details
        result["rollback"] = rollback
    finally:
        result["warehouse_started_by_seed"] = started_by_seed
        if started_by_seed:
            stop_status, stop_payload = request_json(
                host + "/api/2.0/sql/warehouses/" + path_segment(warehouse_id) + "/stop",
                method="POST",
                headers=headers,
                data=b"{}",
            )
            result["warehouse_stop_http_status"] = stop_status
            if stop_status in (200, 202):
                print("SEED_WAREHOUSE_STOP=accepted", flush=True)
                result["final_warehouse_state"] = wait_warehouse(
                    host, headers, warehouse_id, {"STOPPED"}, 180, transitions
                )
            else:
                result["warehouse_stop_error"] = error_summary(stop_payload)
        result["warehouse_state_transitions"] = transitions
    return result

