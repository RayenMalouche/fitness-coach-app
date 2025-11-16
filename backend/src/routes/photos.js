// Photo Upload Routes
// Handles meal photo uploads from clients

const express = require('express');
const {
  upload,
  uploadPhoto,
  getClientPhotos,
  getAllPhotos,
  getPhotoById,
  deletePhoto
} = require('../controllers/photoController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * POST /api/photos/upload
 * Upload a meal photo (approved CLIENT only)
 */
router.post('/upload', authenticate, isApprovedClient, upload.single('image'), uploadPhoto);

/**
 * GET /api/photos/all
 * Get all photos for coach (COACH only)
 */
router.get('/all', authenticate, isCoach, getAllPhotos);

/**
 * GET /api/photos/my
 * Get own photos (CLIENT only)
 */
router.get('/my', authenticate, isApprovedClient, getClientPhotos);

/**
 * GET /api/photos/client/:clientId
 * Get client's photos (COACH only)
 */
router.get('/client/:clientId', authenticate, isCoach, getClientPhotos);

/**
 * GET /api/photos/:photoId
 * Get single photo details
 */
router.get('/:photoId', authenticate, isCoachOrApprovedClient, getPhotoById);

/**
 * DELETE /api/photos/:photoId
 * Delete a photo
 */
router.delete('/:photoId', authenticate, isCoachOrApprovedClient, deletePhoto);

module.exports = router;