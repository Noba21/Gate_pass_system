-- Fix seed user passwords (run if login says "Invalid credentials")
-- Updates password for: admin@example.com, store@example.com, director@example.com, security@example.com
-- New password: password123

-- NOTE: Import into the correct DB (check backend/.env DB_NAME). No hard-coded USE statement.

-- Ensure roles exist (do not assume IDs)
INSERT IGNORE INTO roles (name) VALUES ('STORE_MANAGER');
INSERT IGNORE INTO roles (name) VALUES ('DIRECTOR');
INSERT IGNORE INTO roles (name) VALUES ('SECURITY');
INSERT IGNORE INTO roles (name) VALUES ('ADMIN');

-- Fix password hashes
UPDATE users
SET password_hash = '$2b$10$DZqen.FdZ6GnVdw3a0uwSOmRUdtnQUFuEX2aX8/voR5IHT/5Ff3zS'
WHERE LOWER(TRIM(email)) IN ('admin@example.com', 'store@example.com', 'director@example.com', 'security@example.com');

-- Fix role_id values to match roles table (common root cause)
UPDATE users u
JOIN roles r ON r.name = 'ADMIN'
SET u.role_id = r.id
WHERE LOWER(TRIM(u.email)) = 'admin@example.com';

UPDATE users u
JOIN roles r ON r.name = 'STORE_MANAGER'
SET u.role_id = r.id
WHERE LOWER(TRIM(u.email)) = 'store@example.com';

UPDATE users u
JOIN roles r ON r.name = 'DIRECTOR'
SET u.role_id = r.id
WHERE LOWER(TRIM(u.email)) = 'director@example.com';

UPDATE users u
JOIN roles r ON r.name = 'SECURITY'
SET u.role_id = r.id
WHERE LOWER(TRIM(u.email)) = 'security@example.com';
