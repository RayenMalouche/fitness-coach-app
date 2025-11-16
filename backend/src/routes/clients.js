const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isCoachOrApprovedClient } = require('../middleware/roleCheck');

router.get('/my/credits', authenticate, clientController.getClientCredits);
router.get('/', authenticate, isCoach, clientController.getAllClients);
router.get('/:clientId', authenticate, isCoach, clientController.getClientById);
router.post('/:clientId/approve', authenticate, isCoach, clientController.approveClient);
router.delete('/:clientId/reject', authenticate, isCoach, clientController.rejectClient);
router.put('/:clientId/credits', authenticate, isCoach, clientController.updateClientCredits);
router.get('/:clientId/credits', authenticate, isCoachOrApprovedClient, clientController.getClientCredits);

module.exports = router;