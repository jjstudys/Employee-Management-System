const express = require('express');
const payrollController = require('../controllers/payrollController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_PAYROLL), payrollController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_PAYROLL), payrollController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_PAYROLL), validate(schemas.payroll), payrollController.create);
router.post('/generate-bulk', authorize(PERMISSIONS.MANAGE_PAYROLL), payrollController.generateBulk);
router.patch('/:id/process', authorize(PERMISSIONS.MANAGE_PAYROLL), payrollController.process);
router.patch('/:id/pay', authorize(PERMISSIONS.MANAGE_PAYROLL), payrollController.markPaid);

module.exports = router;
