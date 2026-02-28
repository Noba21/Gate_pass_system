-- Gate Pass System - Seed Users (manual import)
-- Default password for all users: password123
-- Run this after schema.sql. Import via phpMyAdmin into the correct DB (check backend/.env DB_NAME).
--
-- IMPORTANT: This seed file does NOT assume fixed role IDs.
-- It resolves role_id by role name, so it works even if your roles IDs differ.
--
-- Bcrypt hash for "password123" (cost 10):
-- $2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS

-- Ensure roles exist (do not assume fixed IDs)
INSERT IGNORE INTO roles (name) VALUES ('CLIENT');
INSERT IGNORE INTO roles (name) VALUES ('STORE_MANAGER');
INSERT IGNORE INTO roles (name) VALUES ('DIRECTOR');
INSERT IGNORE INTO roles (name) VALUES ('SECURITY');
INSERT IGNORE INTO roles (name) VALUES ('ADMIN');

-- Insert/Update seed users (password: password123)
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'System Admin', 'admin@example.com', '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', r.id
FROM roles r
WHERE r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role_id = VALUES(role_id);

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Store Manager', 'store@example.com', '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', r.id
FROM roles r
WHERE r.name = 'STORE_MANAGER'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role_id = VALUES(role_id);

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Director', 'director@example.com', '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', r.id
FROM roles r
WHERE r.name = 'DIRECTOR'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role_id = VALUES(role_id);

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Security Guard', 'security@example.com', '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS', r.id
FROM roles r
WHERE r.name = 'SECURITY'
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash), role_id = VALUES(role_id);
