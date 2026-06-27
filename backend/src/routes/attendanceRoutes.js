const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_ATTENDANCE), attendanceController.getAll);
router.get('/stats', authorize(PERMISSIONS.VIEW_ATTENDANCE), attendanceController.getStats);
router.post('/check-in', validate(schemas.checkIn), attendanceController.checkIn);
router.post('/check-out', validate(schemas.checkOut), attendanceController.checkOut);
router.post('/mark', authorize(PERMISSIONS.MANAGE_ATTENDANCE), attendanceController.markAttendance);

module.exports = router;
