// Photo Upload Controller
// Handles meal photo uploads from clients

const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'meal-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Upload a meal photo
 * CLIENT only (approved)
 */
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { caption, coachId } = req.body;

    // Validation
    if (!coachId) {
      return res.status(400).json({ error: 'Coach ID is required' });
    }

    // Verify coach exists
    const coach = await prisma.user.findUnique({
      where: { id: coachId, role: 'COACH' }
    });

    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }

    // Create photo record
    const imageUrl = `/uploads/${req.file.filename}`;

    const photo = await prisma.mealPhoto.create({
      data: {
        clientId: req.user.id,
        coachId,
        imageUrl,
        caption: caption || null
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo
    });
  } catch (error) {
    console.error('Upload photo error:', error);

    // Delete uploaded file if database operation fails
    if (req.file) {
      fs.unlink(path.join(uploadsDir, req.file.filename), (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }

    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

/**
 * Get photos for a specific client
 * COACH can see any client's photos, CLIENT can only see their own
 */
const getClientPhotos = async (req, res) => {
  try {
    let clientId;

    // Determine which client's photos to fetch
    if (req.user.role === 'COACH') {
      clientId = req.params.clientId;
    } else {
      clientId = req.user.id;
    }

    const photos = await prisma.mealPhoto.findMany({
      where: { clientId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

/**
 * Get all photos for coach (from all clients)
 * COACH only
 */
const getAllPhotos = async (req, res) => {
  try {
    const photos = await prisma.mealPhoto.findMany({
      where: { coachId: req.user.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get all photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

/**
 * Get single photo details
 */
const getPhotoById = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.mealPhoto.findUnique({
      where: { id: photoId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        coach: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Authorization check
    const isAuthorized =
      req.user.role === 'COACH' && photo.coachId === req.user.id ||
      req.user.role === 'CLIENT' && photo.clientId === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ photo });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
};

/**
 * Delete a photo
 * Both CLIENT (own photos) and COACH can delete
 */
const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.mealPhoto.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Authorization check
    const isAuthorized =
      (req.user.role === 'COACH' && photo.coachId === req.user.id) ||
      (req.user.role === 'CLIENT' && photo.clientId === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete from database
    await prisma.mealPhoto.delete({
      where: { id: photoId }
    });

    // Delete physical file
    const filePath = path.join(__dirname, '..', photo.imageUrl);
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete file:', err);
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

module.exports = {
  upload,
  uploadPhoto,
  getClientPhotos,
  getAllPhotos,
  getPhotoById,
  deletePhoto
};