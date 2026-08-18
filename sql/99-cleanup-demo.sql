-- DESTRUCTIVE: review the resolved catalog and target before running.
-- This removes only the isolated synthetic demonstration schema and all of
-- its tables, views, and managed-volume files.

DROP SCHEMA IF EXISTS <TARGET_CATALOG>.dbx_demo_20260814 CASCADE;

