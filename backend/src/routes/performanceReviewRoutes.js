const express = require('express');
const performanceReviewController = require('../controllers/performanceReviewController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { PERMISSIONS } = require('../utils/constants');
const validate = require('../middleware/validate');
const schemas = require('../validators');

const router = express.Router();
router.use(authenticate);

router.get('/', authorize(PERMISSIONS.VIEW_PERFORMANCE), performanceReviewController.getAll);
router.get('/:id', authorize(PERMISSIONS.VIEW_PERFORMANCE), performanceReviewController.getById);
router.post('/', authorize(PERMISSIONS.MANAGE_PERFORMANCE), validate(schemas.performanceReview), performanceReviewController.create);
router.put('/:id', authorize(PERMISSIONS.MANAGE_PERFORMANCE), performanceReviewController.update);
router.patch('/:id/submit', authorize(PERMISSIONS.MANAGE_PERFORMANCE), performanceReviewController.submit);
router.patch('/:id/acknowledge', performanceReviewController.acknowledge);

module.exports = router;
