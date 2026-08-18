#!/usr/bin/env python3
"""Generate deterministic, non-sensitive datasets for Databricks demos."""

from __future__ import annotations

import csv
import hashlib
import json
import random
from datetime import datetime, timedelta
from pathlib import Path


SEED = 20260814
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "data" / "synthetic"
RNG = random.Random(SEED)


def iso(value: datetime) -> str:
    return value.isoformat(timespec="seconds")


def money(value: float) -> str:
    return f"{value:.2f}"


def write_csv(name: str, rows: list[dict[str, object]]) -> dict[str, object]:
    if not rows:
        raise ValueError(f"No rows generated for {name}")
    path = OUTPUT_DIR / f"{name}.csv"
    fieldnames = list(rows[0].keys())
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    payload = path.read_bytes()
    return {
        "file": path.name,
        "rows": len(rows),
        "columns": fieldnames,
        "bytes": len(payload),
        "sha256": hashlib.sha256(payload).hexdigest(),
    }


def generate_commerce() -> dict[str, list[dict[str, object]]]:
    regions = ["华东", "华南", "华北", "西南", "东北"]
    segments = ["个人", "小微企业", "中型企业", "战略客户"]
    categories = ["智能家居", "办公设备", "网络设备", "存储设备", "软件订阅"]

    customers: list[dict[str, object]] = []
    for index in range(1, 301):
        customers.append(
            {
                "customer_id": f"C{index:05d}",
                "customer_name": f"演示客户-{index:05d}",
                "email": f"customer{index:05d}@example.invalid",
                "segment": RNG.choices(segments, [48, 28, 18, 6])[0],
                "region": RNG.choice(regions),
                "signup_date": (datetime(2023, 1, 1) + timedelta(days=RNG.randrange(0, 1200))).date().isoformat(),
                "is_vip": "true" if index % 17 == 0 else "false",
            }
        )

    products: list[dict[str, object]] = []
    product_price: dict[str, float] = {}
    for index in range(1, 61):
        category = categories[(index - 1) % len(categories)]
        price = round(79 + (index % 12) * 113.5 + RNG.uniform(0, 80), 2)
        product_id = f"P{index:04d}"
        product_price[product_id] = price
        products.append(
            {
                "product_id": product_id,
                "product_name": f"{category}-演示产品-{index:02d}",
                "category": category,
                "unit_price": money(price),
                "warranty_days": RNG.choice([180, 365, 730, 1095]),
                "active": "true" if index % 19 else "false",
            }
        )

    customers_by_id = {row["customer_id"]: row for row in customers}
    orders: list[dict[str, object]] = []
    order_items: list[dict[str, object]] = []
    refunds: list[dict[str, object]] = []
    order_ids: list[str] = []
    order_item_counter = 1
    refund_counter = 1
    base = datetime(2025, 8, 1, 8, 0)

    for index in range(1, 2401):
        order_id = f"O{index:07d}"
        order_ids.append(order_id)
        customer_id = RNG.choice(customers)["customer_id"]
        order_ts = base + timedelta(minutes=RNG.randrange(0, 365 * 24 * 60))
        status = RNG.choices(
            ["completed", "shipped", "processing", "cancelled"], [78, 9, 7, 6]
        )[0]
        item_count = RNG.randint(1, 4)
        total = 0.0
        selected_products = RNG.sample(products, item_count)
        for product in selected_products:
            quantity = RNG.choices([1, 2, 3], [78, 18, 4])[0]
            unit_price = product_price[str(product["product_id"])]
            discount_pct = RNG.choice([0, 0, 0, 5, 10, 15])
            line_total = unit_price * quantity * (1 - discount_pct / 100)
            total += line_total
            order_items.append(
                {
                    "order_item_id": f"OI{order_item_counter:08d}",
                    "order_id": order_id,
                    "product_id": product["product_id"],
                    "quantity": quantity,
                    "unit_price": money(unit_price),
                    "discount_pct": discount_pct,
                    "line_amount": money(line_total),
                }
            )
            order_item_counter += 1
        orders.append(
            {
                "order_id": order_id,
                "customer_id": customer_id,
                "order_ts": iso(order_ts),
                "channel": RNG.choice(["web", "mobile", "partner", "store"]),
                "status": status,
                "region": customers_by_id[customer_id]["region"],
                "payment_method": RNG.choice(["card", "wallet", "bank_transfer"]),
                "total_amount": money(total if status != "cancelled" else 0),
            }
        )

        refund_probability = 0.17 if order_ts.month in (6, 7, 8) else 0.10
        if status in ("completed", "shipped") and RNG.random() < refund_probability:
            requested = order_ts + timedelta(days=RNG.randint(2, 25))
            refund_status = RNG.choices(["approved", "rejected", "pending"], [72, 18, 10])[0]
            completed = requested + timedelta(hours=RNG.randint(2, 96)) if refund_status != "pending" else None
            refunds.append(
                {
                    "refund_id": f"R{refund_counter:06d}",
                    "order_id": order_id,
                    "requested_ts": iso(requested),
                    "completed_ts": iso(completed) if completed else "",
                    "reason": RNG.choice(["质量问题", "与描述不符", "物流破损", "误购", "兼容性问题"]),
                    "status": refund_status,
                    "amount": money(total * RNG.uniform(0.35, 1.0)),
                }
            )
            refund_counter += 1

    support_tickets: list[dict[str, object]] = []
    ticket_categories = ["退款", "物流", "产品故障", "账号", "安装配置", "发票"]
    summaries = {
        "退款": "客户询问退款进度，希望确认预计到账时间。",
        "物流": "客户反馈物流状态长时间未更新，请协助核查。",
        "产品故障": "设备在使用中出现间歇性故障，需要排查和售后建议。",
        "账号": "客户无法访问订阅服务，需要确认账号状态。",
        "安装配置": "客户需要产品安装与网络配置指导。",
        "发票": "客户申请变更发票信息并重新开具。",
    }
    for index in range(1, 701):
        customer = RNG.choice(customers)
        related_order = RNG.choice(order_ids) if RNG.random() < 0.86 else ""
        category = RNG.choices(ticket_categories, [25, 18, 20, 8, 19, 10])[0]
        created = datetime(2026, 1, 1) + timedelta(minutes=RNG.randrange(0, 225 * 24 * 60))
        priority = RNG.choices(["P1", "P2", "P3", "P4"], [4, 18, 56, 22])[0]
        status = RNG.choices(["resolved", "closed", "open", "waiting_customer"], [50, 25, 15, 10])[0]
        resolution = "" if status in ("open", "waiting_customer") else RNG.randint(18, 3600)
        support_tickets.append(
            {
                "ticket_id": f"T{index:06d}",
                "customer_id": customer["customer_id"],
                "order_id": related_order,
                "created_ts": iso(created),
                "category": category,
                "priority": priority,
                "channel": RNG.choice(["chat", "phone", "email", "app"]),
                "sentiment": RNG.choices(["negative", "neutral", "positive"], [42, 48, 10])[0],
                "status": status,
                "resolution_minutes": resolution,
                "summary": summaries[category],
            }
        )

    support_policies = [
        {
            "policy_id": "POL-RET-001",
            "title": "标准退货政策",
            "category": "退款",
            "effective_date": "2026-01-01",
            "content": "签收后七个自然日内可申请无理由退货。定制商品、已激活软件和影响二次销售的商品除外。退款必须经过订单状态和商品状态核验。",
            "approval_required": "true",
        },
        {
            "policy_id": "POL-QUA-001",
            "title": "质量问题处理",
            "category": "产品故障",
            "effective_date": "2026-01-01",
            "content": "保修期内的质量问题应先完成序列号、购买日期和故障现象核验。涉及换机或大额退款时需要售后主管批准。",
            "approval_required": "true",
        },
        {
            "policy_id": "POL-LOG-001",
            "title": "物流异常升级",
            "category": "物流",
            "effective_date": "2026-03-01",
            "content": "物流状态超过四十八小时未更新时创建承运商查询。超过七十二小时或确认丢失时升级人工处理，不得由自动化系统直接承诺赔偿。",
            "approval_required": "true",
        },
        {
            "policy_id": "POL-ACC-001",
            "title": "账号与订阅访问",
            "category": "账号",
            "effective_date": "2026-02-01",
            "content": "账号恢复前必须验证订单、订阅状态和用户控制的验证因素。演示系统不得请求或记录真实密码和验证码。",
            "approval_required": "true",
        },
        {
            "policy_id": "POL-INV-001",
            "title": "发票变更",
            "category": "发票",
            "effective_date": "2026-01-01",
            "content": "发票抬头变更必须由客户确认新信息。自动化系统只能生成处理草稿，不得伪造或直接提交税务凭证。",
            "approval_required": "true",
        },
    ]

    return {
        "customers": customers,
        "products": products,
        "orders": orders,
        "order_items": order_items,
        "refunds": refunds,
        "support_tickets": support_tickets,
        "support_policies": support_policies,
    }


def generate_database_ops() -> dict[str, list[dict[str, object]]]:
    engines = [("PostgreSQL", "16.3"), ("MySQL", "8.4"), ("Cassandra", "5.0")]
    regions = ["cn-demo-east", "cn-demo-south", "cn-demo-north"]
    instances: list[dict[str, object]] = []
    for index in range(1, 13):
        engine, version = engines[(index - 1) % len(engines)]
        instances.append(
            {
                "instance_id": f"DB{index:03d}",
                "instance_name": f"db-demo-{index:02d}.invalid",
                "engine": engine,
                "version": version,
                "region": regions[(index - 1) % len(regions)],
                "service_tier": RNG.choice(["gold", "silver", "bronze"]),
                "owner_team": RNG.choice(["订单平台", "用户平台", "支付平台", "数据服务"]),
                "cpu_cores": RNG.choice([4, 8, 16, 32]),
                "memory_gb": RNG.choice([16, 32, 64, 128]),
                "production": "false",
            }
        )

    incident_windows = [
        {
            "incident_id": "INC-001",
            "instance_id": "DB003",
            "start": datetime(2026, 8, 3, 10, 0),
            "end": datetime(2026, 8, 3, 12, 0),
            "severity": "SEV-1",
            "symptom": "查询延迟和 CPU 同时升高",
            "root_cause": "报表变更触发全表扫描并放大并发",
            "resolution": "回滚报表变更并增加受控索引评审",
        },
        {
            "incident_id": "INC-002",
            "instance_id": "DB007",
            "start": datetime(2026, 8, 5, 14, 0),
            "end": datetime(2026, 8, 5, 15, 30),
            "severity": "SEV-2",
            "symptom": "事务等待和锁等待显著升高",
            "root_cause": "批处理事务范围过大导致热点行锁竞争",
            "resolution": "停止演示批任务并缩小事务批次",
        },
        {
            "incident_id": "INC-003",
            "instance_id": "DB009",
            "start": datetime(2026, 8, 6, 2, 0),
            "end": datetime(2026, 8, 6, 5, 0),
            "severity": "SEV-2",
            "symptom": "连接数接近上限并出现超时",
            "root_cause": "应用连接池配置变更未正确释放空闲连接",
            "resolution": "回滚连接池配置并限制每实例连接数",
        },
    ]

    metrics: list[dict[str, object]] = []
    start = datetime(2026, 8, 1, 0, 0)
    points = 7 * 24 * 4
    for instance in instances:
        instance_id = str(instance["instance_id"])
        base_cpu = RNG.uniform(18, 42)
        base_qps = RNG.uniform(120, 900)
        for offset in range(points):
            observed = start + timedelta(minutes=15 * offset)
            daytime = 1.25 if 8 <= observed.hour <= 21 else 0.62
            cpu = base_cpu * daytime + RNG.uniform(-6, 7)
            memory = RNG.uniform(44, 68)
            qps = base_qps * daytime * RNG.uniform(0.83, 1.17)
            latency = RNG.uniform(8, 42) * (1.2 if daytime > 1 else 0.8)
            connections = RNG.randint(18, 90)
            lock_waits = RNG.randint(0, 3)
            error_rate = RNG.uniform(0, 0.018)
            for incident in incident_windows:
                if (
                    incident["instance_id"] == instance_id
                    and incident["start"] <= observed <= incident["end"]
                ):
                    if incident["incident_id"] == "INC-001":
                        cpu += 46
                        qps *= 1.65
                        latency *= 6.5
                        error_rate += 0.08
                    elif incident["incident_id"] == "INC-002":
                        cpu += 17
                        latency *= 8.0
                        lock_waits += RNG.randint(35, 110)
                        error_rate += 0.04
                    else:
                        connections += 360
                        latency *= 5.0
                        error_rate += 0.13
            metrics.append(
                {
                    "instance_id": instance_id,
                    "observed_ts": iso(observed),
                    "cpu_pct": f"{min(max(cpu, 1), 99.8):.2f}",
                    "memory_pct": f"{min(memory, 98):.2f}",
                    "qps": f"{max(qps, 1):.2f}",
                    "p95_latency_ms": f"{latency:.2f}",
                    "active_connections": connections,
                    "lock_waits": lock_waits,
                    "error_rate": f"{min(error_rate, 0.99):.5f}",
                }
            )

    changes: list[dict[str, object]] = []
    for index in range(1, 61):
        instance = RNG.choice(instances)
        changed = start + timedelta(minutes=RNG.randrange(0, 7 * 24 * 60))
        changes.append(
            {
                "change_id": f"CHG-{index:04d}",
                "instance_id": instance["instance_id"],
                "changed_ts": iso(changed),
                "change_type": RNG.choice(["配置", "发布", "索引", "扩缩容", "维护"]),
                "description": "合成演示变更，不对应任何真实系统。",
                "operator": RNG.choice(["demo-automation", "demo-engineer"]),
                "approved": "true" if index % 9 else "false",
            }
        )
    injected_changes = [
        ("DB003", datetime(2026, 8, 3, 9, 45), "发布", "报表查询模板变更，包含低选择性过滤。"),
        ("DB007", datetime(2026, 8, 5, 13, 40), "配置", "批处理事务批次从 100 调整为 5000。"),
        ("DB009", datetime(2026, 8, 6, 1, 30), "配置", "应用连接池最大连接数和空闲回收参数变更。"),
    ]
    for offset, (instance_id, changed, change_type, description) in enumerate(injected_changes, 61):
        changes.append(
            {
                "change_id": f"CHG-{offset:04d}",
                "instance_id": instance_id,
                "changed_ts": iso(changed),
                "change_type": change_type,
                "description": description,
                "operator": "demo-automation",
                "approved": "true",
            }
        )

    slow_queries: list[dict[str, object]] = []
    fingerprints = [
        "SELECT orders JOIN order_items WHERE created_at BETWEEN ? AND ?",
        "UPDATE inventory SET reserved = reserved + ? WHERE sku = ?",
        "SELECT customer_profile WHERE customer_id = ?",
        "DELETE session_events WHERE expires_at < ?",
        "SELECT metrics GROUP BY instance_id, time_bucket(?)",
    ]
    for index in range(1, 551):
        instance = RNG.choice(instances)
        observed = start + timedelta(minutes=RNG.randrange(0, 7 * 24 * 60))
        duration = RNG.uniform(450, 7800)
        wait_event = RNG.choice(["CPU", "IO", "Lock", "Network", "None"])
        for incident in incident_windows:
            if incident["instance_id"] == instance["instance_id"] and incident["start"] <= observed <= incident["end"]:
                duration *= 8
                wait_event = "Lock" if incident["incident_id"] == "INC-002" else "CPU"
        slow_queries.append(
            {
                "query_id": f"Q{index:07d}",
                "instance_id": instance["instance_id"],
                "observed_ts": iso(observed),
                "query_fingerprint": RNG.choice(fingerprints),
                "duration_ms": f"{duration:.2f}",
                "rows_examined": RNG.randint(1_000, 30_000_000),
                "rows_returned": RNG.randint(0, 50_000),
                "query_type": RNG.choice(["SELECT", "SELECT", "SELECT", "UPDATE", "DELETE"]),
                "wait_event": wait_event,
            }
        )

    alerts: list[dict[str, object]] = []
    for index, incident in enumerate(incident_windows, 1):
        alerts.extend(
            [
                {
                    "alert_id": f"ALT-{index:03d}-A",
                    "instance_id": incident["instance_id"],
                    "fired_ts": iso(incident["start"] + timedelta(minutes=15)),
                    "severity": incident["severity"],
                    "metric": "p95_latency_ms",
                    "threshold": "250",
                    "observed_value": "1250",
                    "status": "resolved",
                },
                {
                    "alert_id": f"ALT-{index:03d}-B",
                    "instance_id": incident["instance_id"],
                    "fired_ts": iso(incident["start"] + timedelta(minutes=30)),
                    "severity": incident["severity"],
                    "metric": "error_rate",
                    "threshold": "0.05",
                    "observed_value": "0.12",
                    "status": "resolved",
                },
            ]
        )
    for index in range(7, 67):
        instance = RNG.choice(instances)
        alerts.append(
            {
                "alert_id": f"ALT-{index:03d}",
                "instance_id": instance["instance_id"],
                "fired_ts": iso(start + timedelta(minutes=RNG.randrange(0, 7 * 24 * 60))),
                "severity": RNG.choice(["SEV-3", "SEV-4"]),
                "metric": RNG.choice(["cpu_pct", "memory_pct", "replication_lag", "disk_usage"]),
                "threshold": RNG.choice(["80", "85", "90"]),
                "observed_value": RNG.choice(["81", "88", "94"]),
                "status": RNG.choice(["resolved", "resolved", "suppressed"]),
            }
        )

    incidents: list[dict[str, object]] = []
    for incident in incident_windows:
        incidents.append(
            {
                "incident_id": incident["incident_id"],
                "instance_id": incident["instance_id"],
                "started_ts": iso(incident["start"]),
                "ended_ts": iso(incident["end"]),
                "severity": incident["severity"],
                "symptom": incident["symptom"],
                "root_cause": incident["root_cause"],
                "resolution": incident["resolution"],
                "status": "resolved",
            }
        )

    runbooks = [
        {
            "runbook_id": "RB-CPU-001",
            "title": "数据库 CPU 与查询延迟同时升高",
            "symptom_pattern": "cpu_pct 高于 85 且 p95_latency_ms 持续升高",
            "diagnostic_steps": "确认异常起始时间；比较 QPS；检查慢查询指纹；关联异常前一小时的变更；确认是否存在全表扫描。",
            "safe_actions": "收集证据；暂停非关键报表任务；生成回滚建议；创建工单草稿。",
            "prohibited_actions": "未经批准不得终止生产查询、创建索引、扩容或回滚发布。",
            "approval_required": "true",
        },
        {
            "runbook_id": "RB-LOCK-001",
            "title": "锁等待和事务阻塞",
            "symptom_pattern": "lock_waits 快速升高且写请求延迟增加",
            "diagnostic_steps": "定位等待链；检查长事务；关联批处理和发布变更；确认热点表和热点键。",
            "safe_actions": "保存等待链证据；通知变更负责人；生成缩小事务批次建议。",
            "prohibited_actions": "未经批准不得强制终止事务或修改隔离级别。",
            "approval_required": "true",
        },
        {
            "runbook_id": "RB-CONN-001",
            "title": "连接池耗尽",
            "symptom_pattern": "active_connections 接近上限且错误率和超时增加",
            "diagnostic_steps": "检查连接来源；确认连接池参数变更；分析空闲连接；核对数据库连接上限。",
            "safe_actions": "生成回滚连接池配置建议；限制新流量建议；创建应用负责人通知草稿。",
            "prohibited_actions": "不得自动重启数据库、修改最大连接数或中断生产流量。",
            "approval_required": "true",
        },
        {
            "runbook_id": "RB-DISK-001",
            "title": "磁盘空间趋势异常",
            "symptom_pattern": "disk_usage 持续增长并接近告警阈值",
            "diagnostic_steps": "检查表和日志增长；确认保留策略；关联批量导入；估算剩余时间。",
            "safe_actions": "生成容量报告和扩容建议；创建清理候选清单。",
            "prohibited_actions": "不得自动删除文件、表、日志或备份。",
            "approval_required": "true",
        },
    ]

    return {
        "db_instances": instances,
        "db_metrics": metrics,
        "slow_queries": slow_queries,
        "alerts": alerts,
        "changes": changes,
        "incidents": incidents,
        "runbooks": runbooks,
    }


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    datasets = {**generate_commerce(), **generate_database_ops()}
    manifest = {
        "generated_at": "2026-08-14T00:00:00+08:00",
        "seed": SEED,
        "classification": "SYNTHETIC_NON_SENSITIVE",
        "notice": "All people, organizations, hosts, events and metrics are fictional.",
        "datasets": {},
    }
    for name, rows in datasets.items():
        manifest["datasets"][name] = write_csv(name, rows)

    manifest_path = OUTPUT_DIR / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    manifest_hash = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    print(f"Generated {len(datasets)} datasets in {OUTPUT_DIR}")
    print(f"Manifest SHA-256: {manifest_hash}")
    for name, details in manifest["datasets"].items():
        print(f"{name}: {details['rows']} rows, {details['bytes']} bytes")


if __name__ == "__main__":
    main()

