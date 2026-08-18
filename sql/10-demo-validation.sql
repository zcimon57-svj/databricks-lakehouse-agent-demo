-- Replace <TARGET_CATALOG> in a private working copy before execution.
-- All objects below contain deterministic synthetic, non-sensitive data.

SELECT 'customers' AS table_name, COUNT(*) AS row_count
FROM <TARGET_CATALOG>.dbx_demo_20260814.customers
UNION ALL SELECT 'products', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.products
UNION ALL SELECT 'orders', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.orders
UNION ALL SELECT 'order_items', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.order_items
UNION ALL SELECT 'refunds', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.refunds
UNION ALL SELECT 'support_tickets', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.support_tickets
UNION ALL SELECT 'support_policies', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.support_policies
UNION ALL SELECT 'db_instances', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.db_instances
UNION ALL SELECT 'db_metrics', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.db_metrics
UNION ALL SELECT 'slow_queries', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.slow_queries
UNION ALL SELECT 'alerts', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.alerts
UNION ALL SELECT 'changes', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.changes
UNION ALL SELECT 'incidents', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.incidents
UNION ALL SELECT 'runbooks', COUNT(*) FROM <TARGET_CATALOG>.dbx_demo_20260814.runbooks;

SELECT *
FROM <TARGET_CATALOG>.dbx_demo_20260814.dbops_incident_context
ORDER BY started_ts;

SELECT priority, sentiment, ticket_status, COUNT(*) AS ticket_count
FROM <TARGET_CATALOG>.dbx_demo_20260814.after_sales_cases
GROUP BY priority, sentiment, ticket_status
ORDER BY ticket_count DESC;

