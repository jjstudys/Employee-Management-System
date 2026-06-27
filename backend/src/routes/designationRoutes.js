const express = require('express');
const designationController = require('../controllers/designationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_DEPARTMENTS), designationController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_DEPARTMENTS), designationController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), validate(schemas.designation), designationController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), validate(schemas.designation), designationController.update);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), designationController.remove);

module.exports = router;
