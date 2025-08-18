const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// --- Employee-Specific Routes ---
// An employee can request leave and view their own leave history.
// FIX: Changed 'Employee' to match the case used in your JWT/database.
router.post('/request', protect, authorize('Employee'), leaveController.requestLeave);
router.get('/my-leaves', protect, authorize('Employee'), leaveController.getMyLeaveRequests);

// --- Admin/HR/Manager Routes ---
// Privileged users can get all leave requests and update the status of any request.
// FIX: Changed roles to match the case used in your JWT/database.
router.get('/', protect, authorize('Admin', 'HR', 'Manager'), leaveController.getAllLeaveRequests);
router.put('/:id/status', protect, authorize('Admin', 'HR', 'Manager'), leaveController.updateLeaveStatus);

module.exports = router;
