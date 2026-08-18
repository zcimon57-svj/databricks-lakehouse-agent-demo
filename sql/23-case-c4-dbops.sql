-- C4: Database intelligent operations with deterministic incident truth.
-- Replace <TARGET_CATALOG> in a private working copy.

USE CATALOG <TARGET_CATALOG>;
USE SCHEMA dbx_demo_20260814;

-- Ground-truth incident overview.
SELECT *
FROM dbops_incident_context
ORDER BY started_ts;

-- Telemetry around each incident.
SELECT
  i.incident_id,
  m.observed_ts,
  m.cpu_pct,
  m.memory_pct,
  m.qps,
  m.p95_latency_ms,
  m.active_connections,
  m.lock_waits,
  m.error_rate
FROM incidents i
JOIN db_metrics m
  ON i.instance_id = m.instance_id
 AND m.observed_ts BETWEEN i.started_ts - INTERVAL 30 MINUTES
                       AND i.ended_ts + INTERVAL 30 MINUTES
ORDER BY i.incident_id, m.observed_ts;

-- Slow-query evidence during incident windows.
SELECT
  i.incident_id,
  q.query_fingerprint,
  q.query_type,
  q.wait_event,
  COUNT(*) AS observations,
  MAX(q.duration_ms) AS max_duration_ms,
  SUM(q.rows_examined) AS rows_examined
FROM incidents i
JOIN slow_queries q
  ON i.instance_id = q.instance_id
 AND q.observed_ts BETWEEN i.started_ts - INTERVAL 30 MINUTES
                       AND i.ended_ts + INTERVAL 30 MINUTES
GROUP BY i.incident_id, q.query_fingerprint, q.query_type, q.wait_event
ORDER BY i.incident_id, max_duration_ms DESC;

-- Candidate runbooks and prohibited automatic actions.
SELECT runbook_id, title, symptom_pattern, diagnostic_steps, safe_actions, prohibited_actions, approval_required
FROM runbooks
ORDER BY runbook_id;

-- Demonstration boundary:
-- The Agent can collect evidence, correlate changes, select a runbook, draft a
-- recommendation, and create a ticket draft. It must not terminate queries,
-- kill transactions, modify connection limits, create indexes, delete data,
-- or roll back production without explicit approval and a separately scoped tool.

