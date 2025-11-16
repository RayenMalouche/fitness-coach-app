const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

router.get('/bookings/pending', authenticate, isCoach, sessionController.getPendingBookings);
router.get('/bookings/my', authenticate, isApprovedClient, sessionController.getClientBookings);
router.get('/bookings/client/:clientId', authenticate, isCoach, sessionController.getClientBookings);
router.post('/bookings/:bookingId/approve', authenticate, isCoach, sessionController.approveBooking);
router.post('/bookings/:bookingId/reject', authenticate, isCoach, sessionController.rejectBooking);
router.post('/available', authenticate, isCoach, sessionController.createAvailableSession);
router.get('/available', authenticate, isCoachOrApprovedClient, sessionController.getAvailableSessions);
router.delete('/available/:sessionId', authenticate, isCoach, sessionController.deleteSession);
router.post('/:sessionId/book', authenticate, isApprovedClient, sessionController.bookSession);

module.exports = router;