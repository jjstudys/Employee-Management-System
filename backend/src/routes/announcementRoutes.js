const express = require('express');
const announcementController = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();

router.get('/active', authenticate, announcementController.getActive);

router.use(authenticate);
router.get('/', announcementController.getAll);
router.post('/', authorize(PERMISSIONS.MANAGE_ANNOUNCEMENTS), validate(schemas.announcement), announcementController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_ANNOUNCEMENTS), validate(schemas.announcement), announcementController.update);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_ANNOUNCEMENTS), announcementController.remove);

module.exports = router;
