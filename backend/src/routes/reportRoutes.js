const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');

const router = express.Router();
router.use(authenticate, authorize(PERMISSIONS.EXPORT_REPORTS));

router.get('/employees', reportController.exportEmployees);
router.get('/attendance', reportController.exportAttendance);
router.get('/leaves', reportController.exportLeaves);
router.get('/payroll', reportController.exportPayroll);

module.exports = router;
