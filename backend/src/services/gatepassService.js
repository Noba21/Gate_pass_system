const pool = require('../config/db');

const STATUSES = {
  DRAFT: 'DRAFT',
  PENDING_STORE_VERIFICATION: 'PENDING_STORE_VERIFICATION',
  REJECTED_BY_STORE: 'REJECTED_BY_STORE',
  VERIFIED_BY_STORE: 'VERIFIED_BY_STORE',
  REJECTED_BY_DIRECTOR: 'REJECTED_BY_DIRECTOR',
  APPROVED_BY_DIRECTOR: 'APPROVED_BY_DIRECTOR',
  EXITED: 'EXITED',
  RETURNED: 'RETURNED',
};

async function createGatePass({ userId, payload }) {
  const {
    type,
    gatePassDate,
    destination,
    vehiclePlateNumber,
    requestType,
    expectedReturnDate,
    materialItems,
    hrEmployees,
    numberOfEmployees,
    timeDuration,
  } = payload;

  if (!type || !gatePassDate || !destination) {
    throw new Error('type, gatePassDate and destination are required');
  }

  if (type === 'MATERIAL' && (!materialItems || !materialItems.length)) {
    throw new Error('At least one material item is required for MATERIAL requests');
  }

  if (type === 'HUMAN_RESOURCE' && (!hrEmployees || !hrEmployees.length)) {
    throw new Error('At least one employee is required for HUMAN_RESOURCE requests');
  }

  const isReturnable = requestType === 'RETURNABLE' ? 1 : 0;

  if (isReturnable && !expectedReturnDate) {
    throw new Error('expectedReturnDate is required for returnable material requests');
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [gpResult] = await conn.query(
      `INSERT INTO gate_passes
       (type, requestor_id, gate_pass_date, destination, vehicle_plate_number,
        is_returnable, expected_return_date, number_of_employees, time_duration, status, return_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        type,
        userId,
        gatePassDate,
        destination,
        vehiclePlateNumber || null,
        isReturnable,
        expectedReturnDate || null,
        type === 'HUMAN_RESOURCE' ? numberOfEmployees || hrEmployees.length : null,
        type === 'HUMAN_RESOURCE' ? timeDuration || null : null,
        STATUSES.PENDING_STORE_VERIFICATION,
        isReturnable ? 'PENDING_RETURN' : 'NOT_APPLICABLE',
      ]
    );

    const gatePassId = gpResult.insertId;

    if (type === 'MATERIAL') {
      const values = materialItems.map((item) => [
        gatePassId,
        item.itemId,
        item.itemName,
        item.quantity,
        item.unitOfMeasurement,
      ]);
      await conn.query(
        `INSERT INTO material_items
         (gate_pass_id, item_id, item_name, quantity, unit_of_measurement)
         VALUES ?`,
        [values]
      );
    } else if (type === 'HUMAN_RESOURCE') {
      const values = hrEmployees.map((emp) => [
        gatePassId,
        emp.employeeId,
        emp.fullName,
        emp.gender,
        emp.position,
        emp.timeDuration,
      ]);
      await conn.query(
        `INSERT INTO hr_employees
         (gate_pass_id, employee_id, full_name, gender, position, time_duration)
         VALUES ?`,
        [values]
      );
    }

    await conn.query(
      `INSERT INTO status_history (gate_pass_id, from_status, to_status, actor_user_id, note)
       VALUES (?, NULL, ?, ?, ?)`,
      [gatePassId, STATUSES.PENDING_STORE_VERIFICATION, userId, 'Client submitted request']
    );

    await conn.query(
      `INSERT INTO approval_steps (gate_pass_id, step, action, actor_user_id, note)
       VALUES (?, 'CLIENT_SUBMIT', 'SUBMITTED', ?, ?)`,
      [gatePassId, userId, 'Client submitted request']
    );

    await conn.commit();
    return gatePassId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getGatePassById(id) {
  const [rows] = await pool.query(
    `SELECT gp.*, u.full_name AS client_name, r.name AS client_role
     FROM gate_passes gp
     JOIN users u ON gp.requestor_id = u.id
     JOIN roles r ON u.role_id = r.id
     WHERE gp.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getMaterialItems(gatePassId) {
  const [rows] = await pool.query(
    'SELECT * FROM material_items WHERE gate_pass_id = ?',
    [gatePassId]
  );
  return rows;
}

async function getHrEmployees(gatePassId) {
  const [rows] = await pool.query(
    'SELECT * FROM hr_employees WHERE gate_pass_id = ?',
    [gatePassId]
  );
  return rows;
}

async function listClientGatePasses(userId) {
  const [rows] = await pool.query(
    `SELECT * FROM gate_passes
     WHERE requestor_id = ?
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

async function listByStatus(status) {
  const [rows] = await pool.query(
    `SELECT gp.*, u.full_name AS client_name
     FROM gate_passes gp
     JOIN users u ON gp.requestor_id = u.id
     WHERE gp.status = ?
     ORDER BY gp.created_at ASC`,
    [status]
  );
  return rows;
}

async function changeStatus({ gatePassId, actorUserId, fromStatus, toStatus, step, action, note }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existingRows] = await conn.query(
      'SELECT status, is_returnable FROM gate_passes WHERE id = ? FOR UPDATE',
      [gatePassId]
    );

    if (!existingRows.length) {
      throw new Error('Gate pass not found');
    }

    const current = existingRows[0];
    if (current.status !== fromStatus) {
      throw new Error(
        `Invalid operation: expected current status ${fromStatus} but found ${current.status}`
      );
    }

    await conn.query(
      'UPDATE gate_passes SET status = ? WHERE id = ?',
      [toStatus, gatePassId]
    );

    await conn.query(
      `INSERT INTO status_history (gate_pass_id, from_status, to_status, actor_user_id, note)
       VALUES (?, ?, ?, ?, ?)`,
      [gatePassId, fromStatus, toStatus, actorUserId, note || null]
    );

    await conn.query(
      `INSERT INTO approval_steps (gate_pass_id, step, action, actor_user_id, note)
       VALUES (?, ?, ?, ?, ?)`,
      [gatePassId, step, action, actorUserId, note || null]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getHistory(gatePassId) {
  const [rows] = await pool.query(
    `SELECT h.*, u.full_name AS actor_name
     FROM status_history h
     LEFT JOIN users u ON h.actor_user_id = u.id
     WHERE h.gate_pass_id = ?
     ORDER BY h.created_at ASC`,
    [gatePassId]
  );
  return rows;
}

module.exports = {
  STATUSES,
  createGatePass,
  getGatePassById,
  getMaterialItems,
  getHrEmployees,
  listClientGatePasses,
  listByStatus,
  changeStatus,
  getHistory,
};

