// Authentication Routes
// Handles user registration, login, and profile

const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user (CLIENT or COACH)
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', login);

/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
router.get('/profile', authenticate, getProfile);

module.exports = router;