const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

router.get('/all', authenticate, isCoach, photoController.getAllPhotos);
router.get('/my', authenticate, isApprovedClient, photoController.getClientPhotos);
router.get('/client/:clientId', authenticate, isCoach, photoController.getClientPhotos);
router.post('/upload', authenticate, isApprovedClient, photoController.upload.single('image'), photoController.uploadPhoto);
router.get('/:photoId', authenticate, isCoachOrApprovedClient, photoController.getPhotoById);
router.delete('/:photoId', authenticate, isCoachOrApprovedClient, photoController.deletePhoto);

module.exports = router;