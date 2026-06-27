const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');

const router = express.Router();
router.use(authenticate);

router.get('/analytics', authorize(PERMISSIONS.VIEW_ANALYTICS), dashboardController.getAnalytics);
router.get('/employee', dashboardController.getEmployeeDashboard);

module.exports = router;
