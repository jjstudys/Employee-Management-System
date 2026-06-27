const express = require('express');
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const auditLog = require('../middleware/auditLog');
const schemas = require('../validators');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee lifecycle management
 */

router.get('/', authorize(PERMISSIONS.VIEW_EMPLOYEES), employeeController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_EMPLOYEES), employeeController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_EMPLOYEES), validate(schemas.createEmployee), auditLog('CREATE', 'Employee'), employeeController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_EMPLOYEES), validate(schemas.updateEmployee), auditLog('UPDATE', 'Employee'), employeeController.update);
router.post('/:id/photo', authorize(PERMISSIONS.MANAGE_EMPLOYEES), upload.single('photo'), employeeController.uploadPhoto);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_EMPLOYEES), auditLog('DELETE', 'Employee'), employeeController.remove);

module.exports = router;
