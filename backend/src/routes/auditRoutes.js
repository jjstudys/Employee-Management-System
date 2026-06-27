const express = require('express');
const auditController = require('../controllers/auditController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');

const router = express.Router();
router.use(authenticate);

router.get('/logs', authorize(PERMISSIONS.VIEW_AUDIT_LOGS), auditController.getAuditLogs);
router.get('/activities', authorize(PERMISSIONS.VIEW_AUDIT_LOGS), auditController.getActivities);

module.exports = router;
