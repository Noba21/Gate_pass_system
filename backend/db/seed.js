/**
 * Seed script: creates admin + test users for each role.
 * Default password for all: password123
 * Run: node db/seed.js (from backend folder)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const PASSWORD = 'password123';

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'habesha_gate_pass',
  });

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const users = [
    { full_name: 'System Admin', email: 'admin@example.com', role_id: 5 },
    { full_name: 'Store Manager', email: 'store@example.com', role_id: 2 },
    { full_name: 'Director', email: 'director@example.com', role_id: 3 },
    { full_name: 'Security Guard', email: 'security@example.com', role_id: 4 },
  ];

  // Ensure ADMIN role exists
  await pool.query(
    "INSERT IGNORE INTO roles (id, name) VALUES (5, 'ADMIN')"
  );

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password_hash = VALUES(password_hash)`,
      [u.full_name, u.email, passwordHash, u.role_id]
    );
  }

  console.log('Seed completed. Users (password: password123):');
  console.log('  admin@example.com   - ADMIN');
  console.log('  store@example.com   - STORE_MANAGER');
  console.log('  director@example.com - DIRECTOR');
  console.log('  security@example.com - SECURITY');
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
