// Client Management Routes
// Handles client listing, approval, and credit management

const express = require('express');
const {
  getAllClients,
  getClientById,
  approveClient,
  rejectClient,
  updateClientCredits,
  getClientCredits
} = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isCoachOrApprovedClient } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * GET /api/clients
 * Get all clients (COACH only)
 */
router.get('/', authenticate, isCoach, getAllClients);

/**
 * GET /api/clients/:clientId
 * Get single client details (COACH only)
 */
router.get('/:clientId', authenticate, isCoach, getClientById);

/**
 * POST /api/clients/:clientId/approve
 * Approve a pending client (COACH only)
 */
router.post('/:clientId/approve', authenticate, isCoach, approveClient);

/**
 * DELETE /api/clients/:clientId/reject
 * Reject a pending client (COACH only)
 */
router.delete('/:clientId/reject', authenticate, isCoach, rejectClient);

/**
 * PUT /api/clients/:clientId/credits
 * Set or update client's session credits (COACH only)
 */
router.put('/:clientId/credits', authenticate, isCoach, updateClientCredits);

/**
 * GET /api/clients/:clientId/credits
 * Get client's remaining credits (COACH or own CLIENT)
 */
router.get('/:clientId/credits', authenticate, isCoachOrApprovedClient, getClientCredits);

/**
 * GET /api/clients/my/credits
 * Get own credits (CLIENT only)
 */
router.get('/my/credits', authenticate, getClientCredits);

module.exports = router;