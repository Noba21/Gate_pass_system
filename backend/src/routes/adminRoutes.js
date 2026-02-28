const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

const MANAGED_ROLES = new Set(['STORE_MANAGER', 'DIRECTOR', 'SECURITY']);

// Get all users (optionally filter by role)
router.get('/users', async (req, res, next) => {
  try {
    const { role } = req.query;
    let sql = `
      SELECT u.id, u.full_name, u.email, u.role_id, r.name AS role, u.is_active, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.role_id, u.full_name
    `;
    const [rows] = await pool.query(sql);
    const users = rows.map((u) => ({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      isActive: Boolean(u.is_active),
      createdAt: u.created_at,
    }));
    const roleFilter = req.query.role;
    const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

// Create user (Store Manager, Director, Security)
router.post('/users', async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: 'Full name, email, password and role are required' });
    }

    if (!MANAGED_ROLES.has(role)) {
      return res.status(400).json({
        message: 'Invalid role. Use STORE_MANAGER, DIRECTOR, or SECURITY',
      });
    }

    const [[roleRow]] = await pool.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [role]);
    if (!roleRow) {
      return res.status(500).json({ message: `Role ${role} is not configured in database` });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );
    if (existing.length) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES (?, ?, ?, ?)`,
      [fullName.trim(), email.trim().toLowerCase(), passwordHash, roleRow.id]
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete('/users/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Analytics: gate pass counts by status, type, and summary
router.get('/stats', async (req, res, next) => {
  try {
    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM gate_passes GROUP BY status ORDER BY status`
    );
    const [byType] = await pool.query(
      `SELECT type, COUNT(*) AS count FROM gate_passes GROUP BY type`
    );
    const [total] = await pool.query(
      'SELECT COUNT(*) AS total FROM gate_passes'
    );
    const [recent] = await pool.query(
      `SELECT COUNT(*) AS count FROM gate_passes
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    res.json({
      byStatus: byStatus.reduce((acc, r) => ({ ...acc, [r.status]: r.count }), {}),
      byType: byType.reduce((acc, r) => ({ ...acc, [r.type]: r.count }), {}),
      total: total[0].total,
      last30Days: recent[0].count,
    });
  } catch (err) {
    next(err);
  }
});

// Report: gate passes over time (last 30 days, grouped by date)
router.get('/reports/daily', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count, type
       FROM gate_passes
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at), type
       ORDER BY date ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Report: gate passes by client (top requestors)
router.get('/reports/by-client', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.full_name, u.email, COUNT(gp.id) AS total_requests,
              SUM(CASE WHEN gp.status = 'RETURNED' THEN 1 ELSE 0 END) AS returned,
              SUM(CASE WHEN gp.status IN ('APPROVED_BY_DIRECTOR','EXITED','RETURNED') THEN 1 ELSE 0 END) AS approved
       FROM users u
       JOIN roles ur ON ur.id = u.role_id
       JOIN gate_passes gp ON gp.requestor_id = u.id
       WHERE ur.name = 'CLIENT'
       GROUP BY u.id
       ORDER BY total_requests DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Report: status flow summary
router.get('/reports/summary', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT status, type, COUNT(*) AS count
       FROM gate_passes
       GROUP BY status, type
       ORDER BY status, type`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
