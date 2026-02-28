const express = require('express');
const authMiddleware = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const gatepassService = require('../services/gatepassService');

const router = express.Router();

const ROLES = {
  CLIENT: 'CLIENT',
  STORE_MANAGER: 'STORE_MANAGER',
  DIRECTOR: 'DIRECTOR',
  SECURITY: 'SECURITY',
};

// Apply auth middleware to all gatepass routes
router.use(authMiddleware);

// ------------------------------------------------------------
// Client endpoints
// ------------------------------------------------------------

router.post('/', requireRole(ROLES.CLIENT), async (req, res, next) => {
  try {
    const gatePassId = await gatepassService.createGatePass({
      userId: req.user.id,
      payload: req.body,
    });
    const created = await gatepassService.getGatePassById(gatePassId);
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get('/mine', requireRole(ROLES.CLIENT), async (req, res, next) => {
  try {
    const list = await gatepassService.listClientGatePasses(req.user.id);
    return res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const gp = await gatepassService.getGatePassById(id);
    if (!gp) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }
    const [materialItems, hrEmployees] = await Promise.all([
      gatepassService.getMaterialItems(id),
      gatepassService.getHrEmployees(id),
    ]);
    return res.json({ gatePass: gp, materialItems, hrEmployees });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------
// Store Manager endpoints
// ------------------------------------------------------------

router.get(
  '/store/pending',
  requireRole(ROLES.STORE_MANAGER),
  async (req, res, next) => {
    try {
      const list = await gatepassService.listByStatus(
        gatepassService.STATUSES.PENDING_STORE_VERIFICATION
      );
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/store/:id/verify',
  requireRole(ROLES.STORE_MANAGER),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.PENDING_STORE_VERIFICATION,
        toStatus: gatepassService.STATUSES.VERIFIED_BY_STORE,
        step: 'STORE_VERIFY',
        action: 'VERIFIED',
        note: note || 'Verified by store manager',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/store/:id/reject',
  requireRole(ROLES.STORE_MANAGER),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.PENDING_STORE_VERIFICATION,
        toStatus: gatepassService.STATUSES.REJECTED_BY_STORE,
        step: 'STORE_VERIFY',
        action: 'REJECTED',
        note: note || 'Rejected by store manager',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------------
// Director endpoints
// ------------------------------------------------------------

router.get(
  '/director/pending',
  requireRole(ROLES.DIRECTOR),
  async (req, res, next) => {
    try {
      const list = await gatepassService.listByStatus(
        gatepassService.STATUSES.VERIFIED_BY_STORE
      );
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/director/:id/approve',
  requireRole(ROLES.DIRECTOR),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.VERIFIED_BY_STORE,
        toStatus: gatepassService.STATUSES.APPROVED_BY_DIRECTOR,
        step: 'DIRECTOR_APPROVE',
        action: 'APPROVED',
        note: note || 'Approved by director',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/director/:id/reject',
  requireRole(ROLES.DIRECTOR),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.VERIFIED_BY_STORE,
        toStatus: gatepassService.STATUSES.REJECTED_BY_DIRECTOR,
        step: 'DIRECTOR_APPROVE',
        action: 'REJECTED',
        note: note || 'Rejected by director',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------------
// Security endpoints
// ------------------------------------------------------------

router.get(
  '/security/pending',
  requireRole(ROLES.SECURITY),
  async (req, res, next) => {
    try {
      const list = await gatepassService.listByStatus(
        gatepassService.STATUSES.APPROVED_BY_DIRECTOR
      );
      return res.json(list);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/security/:id/exit',
  requireRole(ROLES.SECURITY),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.APPROVED_BY_DIRECTOR,
        toStatus: gatepassService.STATUSES.EXITED,
        step: 'SECURITY_UPDATE',
        action: 'EXITED',
        note: note || 'Marked as exited by security',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/security/:id/return',
  requireRole(ROLES.SECURITY),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { note } = req.body;
      await gatepassService.changeStatus({
        gatePassId: id,
        actorUserId: req.user.id,
        fromStatus: gatepassService.STATUSES.APPROVED_BY_DIRECTOR,
        toStatus: gatepassService.STATUSES.RETURNED,
        step: 'SECURITY_UPDATE',
        action: 'RETURNED',
        note: note || 'Marked as returned by security',
      });
      const updated = await gatepassService.getGatePassById(id);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// ------------------------------------------------------------
// History
// ------------------------------------------------------------

router.get('/:id/history', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const history = await gatepassService.getHistory(id);
    return res.json(history);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

