const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const schemas = require('../validators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, hr, manager, employee] }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', validate(schemas.register), authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 *     tags: [Auth]
 */
router.post('/login', authLimiter, validate(schemas.login), authController.login);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validate(schemas.changePassword), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
