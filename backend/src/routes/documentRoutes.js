const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_DOCUMENTS), documentController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_DOCUMENTS), documentController.getById);
router.post('/:employeeId', authorize(PERMISSIONS.MANAGE_DOCUMENTS), upload.single('file'), validate(schemas.document), documentController.upload);
router.patch('/:id/verify', authorize(PERMISSIONS.MANAGE_DOCUMENTS), documentController.verify);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_DOCUMENTS), documentController.remove);

module.exports = router;
