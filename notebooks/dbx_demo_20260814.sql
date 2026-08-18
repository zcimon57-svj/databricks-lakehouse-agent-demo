-- Databricks notebook source
-- MAGIC %md
-- MAGIC # Databricks 数据湖、自然语言售后与数据库运维演示
-- MAGIC
-- MAGIC 本 Notebook 只使用 `dbx_demo_20260814` 中的确定性合成数据。
-- MAGIC `<TARGET_CATALOG>` 由导入工具在工作区内替换，不在公开材料中记录私有 Catalog 名称。

-- COMMAND ----------

USE CATALOG <TARGET_CATALOG>;
USE SCHEMA dbx_demo_20260814;

SHOW TABLES;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## 1. Lakehouse：从 Volume CSV 到 Delta 管理表

DESCRIBE DETAIL orders;

-- COMMAND ----------

DESCRIBE HISTORY orders LIMIT 10;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## 2. 高频分析：区域收入与退款率

SELECT
  o.region,
  COUNT(DISTINCT o.order_id) AS order_count,
  SUM(o.total_amount) AS revenue,
  SUM(COALESCE(r.amount, 0)) AS refund_amount,
  ROUND(SUM(COALESCE(r.amount, 0)) / NULLIF(SUM(o.total_amount), 0), 4) AS refund_rate
FROM orders o
LEFT JOIN refunds r ON o.order_id = r.order_id
GROUP BY o.region
ORDER BY revenue DESC;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## 3. 自然语言可信基线
-- MAGIC
-- MAGIC 问题：哪个区域未解决的 P1 售后工单最多？

SELECT customer_region, COUNT(*) AS ticket_count
FROM after_sales_cases
WHERE priority = 'P1' AND ticket_status NOT IN ('resolved', 'closed')
GROUP BY customer_region
ORDER BY ticket_count DESC, customer_region;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## 4. 智能售后：工作队列

SELECT ticket_id, customer_name, is_vip, customer_region, category, priority,
       sentiment, ticket_status, refund_status, summary
FROM after_sales_cases
WHERE sentiment = 'negative'
  AND priority IN ('P1', 'P2')
  AND ticket_status NOT IN ('resolved', 'closed')
ORDER BY is_vip DESC, priority, created_ts
LIMIT 30;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC 退款、客户消息或工单状态更新都不是本 Notebook 的权限。这里只生成证据和建议。

SELECT policy_id, title, category, content, approval_required
FROM support_policies
ORDER BY category;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC ## 5. 数据库智能运维：事故、告警与变更关联

SELECT *
FROM dbops_incident_context
ORDER BY started_ts;

-- COMMAND ----------

SELECT runbook_id, title, symptom_pattern, diagnostic_steps, safe_actions,
       prohibited_actions, approval_required
FROM runbooks
ORDER BY runbook_id;

-- COMMAND ----------

-- MAGIC %md
-- MAGIC Agent 可以收集证据、选择 Runbook、生成建议和工单草稿；不得未经批准终止查询、修改数据库配置、删除数据或回滚生产变更。

