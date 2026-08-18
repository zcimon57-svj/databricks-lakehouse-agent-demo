-- C3: Intelligent after-sales evidence and approval boundaries.
-- Replace <TARGET_CATALOG> in a private working copy.

USE CATALOG <TARGET_CATALOG>;
USE SCHEMA dbx_demo_20260814;

-- Work queue: negative, high-priority, unresolved tickets.
SELECT
  ticket_id,
  created_ts,
  customer_name,
  is_vip,
  customer_region,
  category,
  priority,
  sentiment,
  ticket_status,
  order_id,
  order_status,
  refund_status,
  summary
FROM after_sales_cases
WHERE sentiment = 'negative'
  AND priority IN ('P1', 'P2')
  AND ticket_status NOT IN ('resolved', 'closed')
ORDER BY is_vip DESC, priority, created_ts
LIMIT 30;

-- Policy lookup: business actions with approval requirements.
SELECT policy_id, title, category, effective_date, content, approval_required
FROM support_policies
ORDER BY category, effective_date DESC;

-- Explainable regional workload summary.
SELECT
  customer_region,
  category,
  COUNT(*) AS ticket_count,
  SUM(CASE WHEN ticket_status NOT IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS unresolved_count,
  ROUND(AVG(resolution_minutes), 2) AS avg_resolution_minutes
FROM after_sales_cases
GROUP BY customer_region, category
ORDER BY unresolved_count DESC, ticket_count DESC;

-- Demonstration boundary:
-- Reading and recommending are allowed. Any refund, order update, outbound
-- customer message, or ticket status mutation requires a separate approved tool.

