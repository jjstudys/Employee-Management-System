const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.MANAGE_USERS), userController.getAll);
router.get('/:id', authorize(PERMISSIONS.MANAGE_USERS), userController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_USERS), validate(schemas.register), userController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_USERS), validate(schemas.register), userController.update);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_USERS), userController.remove);

module.exports = router;
