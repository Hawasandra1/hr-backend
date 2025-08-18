const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
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
    folder: 'profile_pictures',
    format: async (req, file) => 'png',
    public_id: (req, file) => `employee-${req.user.id}-${Date.now()}`,
  },
});

const upload = multer({ storage: storage });

// --- Admin/HR Routes for Managing All Employees ---
router.route('/')
    .get(protect, authorize('Admin', 'HR', 'Manager'), employeeController.getAllEmployees)
    .post(protect, authorize('Admin', 'HR', 'Manager'), employeeController.createEmployee);

router.route('/:id')
    .get(protect, authorize('Admin', 'HR', 'Manager'), employeeController.getEmployeeById)
    .put(protect, authorize('Admin', 'HR', 'Manager'), employeeController.updateEmployee)
    .delete(protect, authorize('Admin', 'HR', 'Manager'), employeeController.deleteEmployee);

// --- Employee Self-Service Routes ---
router.route('/my-profile')
    .get(protect, authorize('Employee'), employeeController.getMyEmployeeProfile)
    .put(protect, authorize('Employee'), employeeController.updateMyEmployeeProfile);

router.put('/my-profile/change-password', protect, authorize('Employee'), employeeController.changePassword);
router.post('/my-profile/upload-picture', protect, authorize('Employee'), upload.single('profilePicture'), employeeController.uploadProfilePicture);

module.exports = router;
