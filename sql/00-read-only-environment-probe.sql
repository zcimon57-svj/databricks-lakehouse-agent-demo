-- Databricks workspace read-only probe.
-- This script creates, modifies, or deletes nothing.
-- Run statements one by one so each result can be captured in the evidence log.

-- P01: Basic SQL execution and current namespace. Intentionally omit current_user()
-- from recorded output to avoid exposing the signed-in email address.
SELECT
  current_catalog() AS current_catalog,
  current_schema() AS current_schema,
  current_date() AS probe_date,
  current_timestamp() AS probe_timestamp;

-- P02: Catalog visibility.
SHOW CATALOGS;

-- P03: Built-in sample schemas.
SHOW SCHEMAS IN samples;

-- P04: Small, bounded read from NYC taxi sample data.
SELECT *
FROM samples.nyctaxi.trips
LIMIT 10;

-- P05: Aggregate query suitable for SQL Editor and external API parity tests.
SELECT
  pickup_zip,
  COUNT(*) AS trip_count,
  ROUND(AVG(fare_amount), 2) AS average_fare
FROM samples.nyctaxi.trips
GROUP BY pickup_zip
ORDER BY trip_count DESC
LIMIT 10;

-- P06: Discover the travel-booking sample tables before selecting a case table.
SHOW TABLES IN samples.wanderbricks;

-- P07: Discover TPC-DS tables for warehouse-style demos.
SHOW TABLES IN samples.tpcds_sf1;

