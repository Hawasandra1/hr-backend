const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures_users',
    format: async (req, file) => 'png',
    public_id: (req, file) => `user-${req.user.id}-${Date.now()}`,
  },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// --- Public Routes ---
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser); // Add logout endpoint

// --- Health check for auth service ---
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'Auth service is running',
        timestamp: new Date().toISOString()
    });
});

// --- Protected Routes ---
router.post('/register-admin', protect, authorize('Admin'), authController.registerAdminUser);


// REMOVED: Test password route (security risk in production)
// Only include this in development environment
if (process.env.NODE_ENV === 'development') {
    router.post('/test-password', async (req, res) => {
        const bcrypt = require('bcryptjs');
        const { User } = require('../models');
        
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        res.json({
            passwordMatch: isMatch,
            storedPassword: user.password,
            inputPassword: password
        });
    });
}

// --- Error handling for multer ---
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
    }
    next(error);
});

module.exports = router;