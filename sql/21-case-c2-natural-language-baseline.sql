-- C2: Trusted SQL baselines for evaluating Genie natural-language answers.
-- Replace <TARGET_CATALOG> in a private working copy.

USE CATALOG <TARGET_CATALOG>;
USE SCHEMA dbx_demo_20260814;

-- Q-NL-01: 一共有多少售后工单？
SELECT COUNT(*) AS ticket_count
FROM support_tickets;

-- Q-NL-02: 哪个区域未解决的 P1 售后工单最多？
SELECT customer_region, COUNT(*) AS ticket_count
FROM after_sales_cases
WHERE priority = 'P1' AND ticket_status NOT IN ('resolved', 'closed')
GROUP BY customer_region
ORDER BY ticket_count DESC, customer_region
LIMIT 5;

-- Q-NL-03: 哪种退款原因对应的退款金额最高？
SELECT reason, COUNT(*) AS refund_count, SUM(amount) AS refund_amount
FROM refunds
GROUP BY reason
ORDER BY refund_amount DESC
LIMIT 5;

-- Q-NL-04: VIP 与非 VIP 客户的平均售后解决时间分别是多少？
SELECT is_vip, COUNT(*) AS ticket_count, ROUND(AVG(resolution_minutes), 2) AS avg_resolution_minutes
FROM after_sales_cases
WHERE resolution_minutes IS NOT NULL
GROUP BY is_vip
ORDER BY is_vip DESC;

-- Q-NL-05: 最近一个有订单的日期中，各渠道收入是多少？
WITH latest_day AS (
  SELECT MAX(DATE(order_ts)) AS order_date FROM orders
)
SELECT DATE(o.order_ts) AS order_date, o.channel, COUNT(*) AS order_count, SUM(o.total_amount) AS revenue
FROM orders o CROSS JOIN latest_day d
WHERE DATE(o.order_ts) = d.order_date
GROUP BY DATE(o.order_ts), o.channel
ORDER BY revenue DESC;

-- Q-NL-06: 三个数据库事故的根因和解决办法是什么？
SELECT incident_id, instance_name, severity, symptom, root_cause, resolution
FROM dbops_incident_context
ORDER BY started_ts;

