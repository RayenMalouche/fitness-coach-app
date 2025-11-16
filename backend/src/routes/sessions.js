// Session Management Routes
// Handles available sessions, bookings, and approvals

const express = require('express');
const {
  createAvailableSession,
  getAvailableSessions,
  bookSession,
  getClientBookings,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  deleteSession
} = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * POST /api/sessions/available
 * Create available session slots (COACH only)
 */
router.post('/available', authenticate, isCoach, createAvailableSession);

/**
 * GET /api/sessions/available
 * Get all available sessions (approved clients and coach)
 */
router.get('/available', authenticate, isCoachOrApprovedClient, getAvailableSessions);

/**
 * DELETE /api/sessions/available/:sessionId
 * Delete an available session (COACH only)
 */
router.delete('/available/:sessionId', authenticate, isCoach, deleteSession);

/**
 * POST /api/sessions/:sessionId/book
 * Book a session (approved CLIENT only)
 */
router.post('/:sessionId/book', authenticate, isApprovedClient, bookSession);

/**
 * GET /api/sessions/bookings/pending
 * Get all pending bookings (COACH only)
 */
router.get('/bookings/pending', authenticate, isCoach, getPendingBookings);

/**
 * GET /api/sessions/bookings/my
 * Get own bookings (CLIENT)
 */
router.get('/bookings/my', authenticate, isApprovedClient, getClientBookings);

/**
 * GET /api/sessions/bookings/client/:clientId
 * Get client's bookings (COACH only)
 */
router.get('/bookings/client/:clientId', authenticate, isCoach, getClientBookings);

/**
 * POST /api/sessions/bookings/:bookingId/approve
 * Approve a booking (COACH only)
 */
router.post('/bookings/:bookingId/approve', authenticate, isCoach, approveBooking);

/**
 * POST /api/sessions/bookings/:bookingId/reject
 * Reject a booking (COACH only)
 */
router.post('/bookings/:bookingId/reject', authenticate, isCoach, rejectBooking);

module.exports = router;