-- Hard reset of auth data for troubleshooting login issues.
-- This will:
--   - Wipe and recreate roles with fixed IDs
--   - Wipe and recreate all users (you will lose existing accounts)
--   - Seed Admin, Store Manager, Director, Security, and a sample Client
--
-- Default password for ALL seeded users: password123
-- Bcrypt hash: $2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS
--
-- IMPORTANT:
--   - Run this in the SAME database your backend uses.
--   - From backend/.env, DB_NAME is currently: habesha_gate_pass
--   - In phpMyAdmin, select that database first, then run this script.

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- Recreate roles with fixed IDs (these match your schema.sql and code assumptions)
INSERT INTO roles (id, name) VALUES
  (1, 'CLIENT'),
  (2, 'STORE_MANAGER'),
  (3, 'DIRECTOR'),
  (4, 'SECURITY'),
  (5, 'ADMIN');

-- Seed users
INSERT INTO users (full_name, email, password_hash, role_id, is_active) VALUES
  ('System Admin', 'admin@example.com',
   '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', 5, 1),
  ('Store Manager', 'store@example.com',
   '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', 2, 1),
  ('Director', 'director@example.com',
   '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', 3, 1),
  ('Security Guard', 'security@example.com',
   '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', 4, 1),
  ('Sample Client', 'client@example.com',
   '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', 1, 1);

