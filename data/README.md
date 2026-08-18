# 合成演示数据

`synthetic/` 中的 CSV 由 `scripts/generate_synthetic_data.py` 确定性生成。它们只用于 Databricks 演示，不包含真实客户、邮箱、主机、数据库、告警、SQL、工单或业务政策。

重新生成：

```bash
python3 scripts/generate_synthetic_data.py
```

生成器使用固定随机种子 `20260814`。`manifest.json` 记录每个文件的行数、列、字节数和 SHA-256，便于上传前后核对。

## 商务与售后数据

- `customers.csv`
- `products.csv`
- `orders.csv`
- `order_items.csv`
- `refunds.csv`
- `support_tickets.csv`
- `support_policies.csv`

## 数据库智能运维数据

- `db_instances.csv`
- `db_metrics.csv`
- `slow_queries.csv`
- `alerts.csv`
- `changes.csv`
- `incidents.csv`
- `runbooks.csv`

其中三个合成故障窗口被显式注入：

- `DB003`：报表变更导致 CPU、延迟和错误率升高；
- `DB007`：批事务过大导致锁等待；
- `DB009`：连接池配置导致连接耗尽。

这让自然语言分析和运维 Agent 有可验证的正确答案，而不是只看模型是否“说得像”。

