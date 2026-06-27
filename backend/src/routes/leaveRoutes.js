const express = require('express');
const leaveController = require('../controllers/leaveController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_LEAVE), leaveController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_LEAVE), leaveController.getById);
router.post('/', validate(schemas.leaveRequest), leaveController.create);
router.patch('/:id/approve', authorize(PERMISSIONS.APPROVE_LEAVE), validate(schemas.leaveApproval), leaveController.approve);
router.patch('/:id/cancel', leaveController.cancel);

module.exports = router;
