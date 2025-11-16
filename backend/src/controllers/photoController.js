// backend/src/controllers/photoController.js
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// Upload photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { caption = '' } = req.body;

    const photo = await prisma.mealPhoto.create({
      data: {
        clientId: req.user.id,
        coachId: req.user.coachId || 1, // Assume coach ID, adjust as needed
        imageUrl: `/uploads/${req.file.filename}`,
        caption,
        sentAt: new Date()
      }
    });

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    if (req.file) fs.unlinkSync(req.file.path); // Clean up failed upload
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// Get all photos (for coach)
const getAllPhotos = async (req, res) => {
  try {
    const photos = await prisma.mealPhoto.findMany({
      orderBy: { sentAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get all photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

// Get client photos
const getClientPhotos = async (req, res) => {
  try {
    const clientId = req.params.clientId ? req.params.clientId : req.user.id;

    if (req.user.role === 'CLIENT' && clientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const photos = await prisma.mealPhoto.findMany({
      where: { clientId },
      orderBy: { sentAt: 'desc' }
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get client photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
};

// Get single photo
const getPhotoById = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.mealPhoto.findUnique({
      where: { id: photoId },
      include: {
        client: {
          select: { id: true, name: true }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check access
    if (req.user.role === 'CLIENT' && photo.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ photo });
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await prisma.mealPhoto.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check access
    if (req.user.role === 'CLIENT' && photo.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../', photo.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.mealPhoto.delete({
      where: { id: photoId }
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
  getAllPhotos,
  getClientPhotos,
  getPhotoById,
  deletePhoto
};