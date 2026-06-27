const express = require('express');
const { department: controller } = require('../controllers/departmentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_DEPARTMENTS), controller.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_DEPARTMENTS), controller.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), validate(schemas.department), controller.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), validate(schemas.department), controller.update);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), controller.remove);

module.exports = router;
