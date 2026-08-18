-- C1: Databricks mainstream Lakehouse flow.
-- Replace <TARGET_CATALOG> in a private working copy.

USE CATALOG <TARGET_CATALOG>;
USE SCHEMA dbx_demo_20260814;

SHOW TABLES;

DESCRIBE DETAIL orders;

DESCRIBE HISTORY orders LIMIT 10;

SELECT order_date, region, channel, status, order_count, revenue
FROM daily_sales
ORDER BY revenue DESC
LIMIT 20;

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

