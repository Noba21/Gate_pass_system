const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const gatepassRoutes = require('./routes/gatepassRoutes');
const adminRoutes = require('./routes/adminRoutes');
const logger = require('./logger');
const pool = require('./config/db');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  morgan('dev', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

app.get('/api/health', async (req, res) => {
  try {
    const [[dbRow]] = await pool.query('SELECT DATABASE() AS db');
    const [[adminRow]] = await pool.query(
      'SELECT COUNT(*) AS c FROM users WHERE LOWER(TRIM(email)) = ?',
      ['admin@example.com']
    );
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbRow.db,
      adminCount: adminRow.c,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/gatepasses', gatepassRoutes);
app.use('/api/admin', adminRoutes);

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Basic error logging; can be replaced with Winston/pino
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

