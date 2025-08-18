// routes/departmentRoutes.js

const express = require('express');
const router = express.Router();
const { Department } = require('../models'); // Import the Department model
const { protect, authorize } = require('../middleware/auth'); // Import auth middleware

// --- CRUD Operations for Departments ---

// @route   POST /api/departments
// @desc    Create a new department
// @access  Private (Admin, HR, Manager)
router.post('/', protect, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required.' });
        }

        const department = await Department.create({ name, description });
        res.status(201).json({ message: 'Department created successfully!', department });
    } catch (error) {
        console.error('Error creating department:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Department with this name already exists.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        res.status(500).json({ message: 'Server error creating department.' });
    }
});

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private (All authenticated users, or specific roles if authorize is added)
// *** RECOMMENDED EDIT: Add authorize middleware here for explicit control ***
router.get('/', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), async (req, res) => { // Added authorize()
    try {
        const departments = await Department.findAll();
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error fetching departments.' });
    }
});

// @route   GET /api/departments/:id
// @desc    Get a single department by ID
// @access  Private (All authenticated users, or specific roles if authorize is added)
// *** RECOMMENDED EDIT: Add authorize middleware here for explicit control ***
router.get('/:id', protect, authorize('Admin', 'HR', 'Manager', 'Employee'), async (req, res) => { // Added authorize()
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json(department);
    } catch (error) {
        console.error('Error fetching department:', error);
        res.status(500).json({ message: 'Server error fetching department.' });
    }
});

// @route   PUT /api/departments/:id
// @desc    Update a department by ID
// @access  Private (Admin, HR, Manager)
router.put('/:id', protect, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const [updatedRows] = await Department.update({ name, description }, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Department not found or no changes made.' });
        }

        const updatedDepartment = await Department.findByPk(req.params.id);
        res.status(200).json({ message: 'Department updated successfully!', department: updatedDepartment });
    } catch (error) {
        console.error('Error updating department:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Department with this name already exists.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        res.status(500).json({ message: 'Server error updating department.' });
    }
});

// @route   DELETE /api/departments/:id
// @desc    Delete a department by ID
// @access  Private (Admin, HR, Manager)
router.delete('/:id', protect, authorize('Admin', 'HR', 'Manager'), async (req, res) => {
    try {
        const deletedRows = await Department.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        res.status(200).json({ message: 'Department deleted successfully!' });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Server error deleting department.' });
    }
});

module.exports = router;