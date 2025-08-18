// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes should be protected and accessible by Admin, HR, or Manager
router.use(protect);
router.use(authorize('Admin', 'HR', 'Manager'));

// Route to get all dashboard overview data (employees, leaves, projects counts)
router.get('/employees-overview', dashboardController.getEmployeesOverview);

// NEW: Route to get employee count per department
router.get('/employee-distribution-by-department', dashboardController.getDepartmentEmployeeDistribution);

// NEW: Route to get leave counts by status
router.get('/leave-status-breakdown', dashboardController.getLeaveStatusBreakdown);

// Removed: router.get('/todo', dashboardController.getTodoList); // Removed for now

module.exports = router;