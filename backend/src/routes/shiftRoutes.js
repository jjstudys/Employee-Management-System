const express = require('express');
const shiftController = require('../controllers/shiftController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_ATTENDANCE), shiftController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_ATTENDANCE), shiftController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_ATTENDANCE), validate(schemas.shift), shiftController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_ATTENDANCE), validate(schemas.shift), shiftController.update);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_ATTENDANCE), shiftController.remove);

module.exports = router;
