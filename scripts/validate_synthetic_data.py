#!/usr/bin/env python3
"""Validate synthetic demo data integrity and safety invariants."""

from __future__ import annotations

import csv
import hashlib
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "synthetic"


def load(name: str) -> list[dict[str, str]]:
    with (DATA_DIR / f"{name}.csv").open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def assert_unique(rows: list[dict[str, str]], key: str, name: str) -> None:
    values = [row[key] for row in rows]
    assert len(values) == len(set(values)), f"{name}.{key} is not unique"


def main() -> None:
    manifest = json.loads((DATA_DIR / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["classification"] == "SYNTHETIC_NON_SENSITIVE"

    for name, details in manifest["datasets"].items():
        path = DATA_DIR / details["file"]
        payload = path.read_bytes()
        assert hashlib.sha256(payload).hexdigest() == details["sha256"], f"hash mismatch: {name}"
        assert len(load(name)) == details["rows"], f"row count mismatch: {name}"

    customers = load("customers")
    products = load("products")
    orders = load("orders")
    order_items = load("order_items")
    refunds = load("refunds")
    tickets = load("support_tickets")
    instances = load("db_instances")
    metrics = load("db_metrics")
    slow_queries = load("slow_queries")
    alerts = load("alerts")
    changes = load("changes")
    incidents = load("incidents")

    primary_keys = [
        (customers, "customer_id", "customers"),
        (products, "product_id", "products"),
        (orders, "order_id", "orders"),
        (order_items, "order_item_id", "order_items"),
        (refunds, "refund_id", "refunds"),
        (tickets, "ticket_id", "support_tickets"),
        (instances, "instance_id", "db_instances"),
        (slow_queries, "query_id", "slow_queries"),
        (alerts, "alert_id", "alerts"),
        (changes, "change_id", "changes"),
        (incidents, "incident_id", "incidents"),
    ]
    for rows, key, name in primary_keys:
        assert_unique(rows, key, name)

    customer_ids = {row["customer_id"] for row in customers}
    product_ids = {row["product_id"] for row in products}
    order_ids = {row["order_id"] for row in orders}
    instance_ids = {row["instance_id"] for row in instances}

    assert all(row["customer_id"] in customer_ids for row in orders)
    assert all(row["order_id"] in order_ids for row in order_items)
    assert all(row["product_id"] in product_ids for row in order_items)
    assert all(row["order_id"] in order_ids for row in refunds)
    assert all(row["customer_id"] in customer_ids for row in tickets)
    assert all(not row["order_id"] or row["order_id"] in order_ids for row in tickets)
    for rows in (metrics, slow_queries, alerts, changes, incidents):
        assert all(row["instance_id"] in instance_ids for row in rows)

    assert all(row["email"].endswith("@example.invalid") for row in customers)
    assert all(row["instance_name"].endswith(".invalid") for row in instances)
    assert all(row["production"] == "false" for row in instances)
    assert {row["incident_id"] for row in incidents} == {"INC-001", "INC-002", "INC-003"}

    incident_windows = {
        row["incident_id"]: (
            row["instance_id"],
            datetime.fromisoformat(row["started_ts"]),
            datetime.fromisoformat(row["ended_ts"]),
        )
        for row in incidents
    }
    by_instance: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in metrics:
        by_instance[row["instance_id"]].append(row)

    anomaly_checks = {
        "INC-001": ("cpu_pct", 80.0),
        "INC-002": ("lock_waits", 25.0),
        "INC-003": ("active_connections", 250.0),
    }
    for incident_id, (metric, threshold) in anomaly_checks.items():
        instance_id, start, end = incident_windows[incident_id]
        values = [
            float(row[metric])
            for row in by_instance[instance_id]
            if start <= datetime.fromisoformat(row["observed_ts"]) <= end
        ]
        assert values and max(values) >= threshold, f"missing injected anomaly: {incident_id}"

    print("SYNTHETIC_DATA_VALIDATION=PASS")
    print(f"DATASETS={len(manifest['datasets'])}")
    print(f"TOTAL_ROWS={sum(item['rows'] for item in manifest['datasets'].values())}")
    print("SAFETY_DOMAINS=example.invalid,.invalid")
    print("INCIDENT_GROUND_TRUTH=INC-001,INC-002,INC-003")


if __name__ == "__main__":
    main()

