// hr-backend/controllers/departmentController.js

const db = require('../models');
const Department = db.Department;
const { Op } = require('sequelize'); // Import Op for potential future search/filter, but not strictly needed for basic getAll

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private (All authenticated users, as per departmentRoutes.js)
exports.getAllDepartments = async (req, res) => {
    try {
        // You can add search, filter, sort logic here later if needed,
        // similar to what we did for employees.
        const departments = await Department.findAll();
        res.status(200).json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error fetching departments.', error: error.message });
    }
};

// @desc    Get a single department by ID
// @route   GET /api/departments/:id
// @access  Private (All authenticated users)
exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }
        res.status(200).json(department);
    } catch (error) {
        console.error('Error fetching department by ID:', error);
        res.status(500).json({ message: 'Server error fetching department.', error: error.message });
    }
};

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Admin, HR)
exports.createDepartment = async (req, res) => {
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
            return res.status(409).json({ message: 'A department with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error creating department.', error: error.message });
    }
};

// @desc    Update a department by ID
// @route   PUT /api/departments/:id
// @access  Private (Admin, HR)
exports.updateDepartment = async (req, res) => {
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
            return res.status(409).json({ message: 'A department with this name already exists.' });
        }
        res.status(500).json({ message: 'Server error updating department.', error: error.message });
    }
};

// @desc    Delete a department by ID
// @route   DELETE /api/departments/:id
// @access  Private (Admin, HR)
exports.deleteDepartment = async (req, res) => {
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
        res.status(500).json({ message: 'Server error deleting department.', error: error.message });
    }
};