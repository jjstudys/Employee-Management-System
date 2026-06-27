const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const employeeRoutes = require('./employeeRoutes');
const departmentRoutes = require('./departmentRoutes');
const designationRoutes = require('./designationRoutes');
const shiftRoutes = require('./shiftRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const leaveRoutes = require('./leaveRoutes');
const payrollRoutes = require('./payrollRoutes');
const performanceReviewRoutes = require('./performanceReviewRoutes');
const documentRoutes = require('./documentRoutes');
const announcementRoutes = require('./announcementRoutes');
const notificationRoutes = require('./notificationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const auditRoutes = require('./auditRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/designations', designationRoutes);
router.use('/shifts', shiftRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/leaves', leaveRoutes);
router.use('/payroll', payrollRoutes);
router.use('/performance-reviews', performanceReviewRoutes);
router.use('/documents', documentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit', auditRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
