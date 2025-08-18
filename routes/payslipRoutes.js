const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslip.controller');
const { protect, authorize } = require('../middleware/auth');

// --- Employee-Specific Route ---
// This must come before the general '/:id' route to be matched correctly.
router.get('/my-payslips', protect, authorize('Employee'), payslipController.getMyPayslips);


// --- Admin/HR/Manager Routes ---
// These routes are protected for privileged users.
router.post('/generate', protect, authorize('Admin', 'HR', 'Manager'), payslipController.generatePayslip);
router.get('/', protect, authorize('Admin', 'HR', 'Manager'), payslipController.getAllPayslips);
router.get('/:id', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), payslipController.getPayslipById); // Employee can also view their own detailed slip
router.put('/:id', protect, authorize('Admin', 'HR', 'Manager'), payslipController.updatePayslip);
router.delete('/:id', protect, authorize('Admin', 'HR', 'Manager'), payslipController.deletePayslip);

module.exports = router;
