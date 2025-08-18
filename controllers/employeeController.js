const db = require('../models');
const Employee = db.Employee;
const Department = db.Department;
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// @desc    Get all active and on-leave employees
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            where: {
                status: { [Op.in]: ['active', 'on leave'] }
            },
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'], required: false }],
            attributes: { exclude: ['password'] }
        });
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error fetching employees.' });
    }
};

// @desc    Get a single employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.params.id, {
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'], required: false }],
            attributes: { exclude: ['password'] }
        });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.status(500).json({ message: 'Server error fetching employee.' });
    }
};

// @desc    Get profile for the currently logged-in employee
exports.getMyEmployeeProfile = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.user.id, {
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'], required: false }],
            attributes: { exclude: ['password'] }
        });
        if (!employee) {
            return res.status(404).send({ message: 'Employee profile not found.' });
        }
        res.status(200).send(employee);
    } catch (error) {
        console.error("Error fetching my employee profile:", error);
        res.status(500).send({ message: 'Server error fetching your profile.' });
    }
};

// @desc    Create a new employee
exports.createEmployee = async (req, res) => {
    try {
        const newEmployee = await Employee.create(req.body);
        const employeeData = newEmployee.toJSON();
        delete employeeData.password;
        res.status(201).json({ message: 'Employee created successfully!', employee: employeeData });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ message: 'Server error creating employee.' });
    }
};

// @desc    Update an employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.password === '' || updateData.password === null) {
            delete updateData.password;
        }
        const [updatedRows] = await Employee.update(updateData, {
            where: { id },
            individualHooks: true
        });
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Employee not found or no changes made.' });
        }
        const updatedEmployee = await Employee.findByPk(id, {
             include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'], required: false }],
             attributes: { exclude: ['password'] }
        });
        res.status(200).json({ message: 'Employee updated successfully!', employee: updatedEmployee });
    } catch (error) {
        console.error('Error updating employee:', error);
        res.status(500).json({ message: 'Server error updating employee.'});
    }
};

// @desc    Update current employee's profile
exports.updateMyEmployeeProfile = async (req, res) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'dateOfBirth'];
        const updateData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: 'No valid fields provided for update.' });
        }
        const [updated] = await Employee.update(updateData, { where: { id: req.user.id } });
        if (updated === 0) {
            return res.status(404).send({ message: 'No employee profile found.' });
        }
        const updatedEmployee = await Employee.findByPk(req.user.id, {
            include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'], required: false }],
            attributes: { exclude: ['password'] }
        });
        return res.status(200).send({ message: 'Profile updated successfully!', employee: updatedEmployee });
    } catch (error) {
        console.error("Error updating my employee profile:", error);
        res.status(500).send({ message: 'Server error updating your profile.' });
    }
};

// @desc    Delete an employee
exports.deleteEmployee = async (req, res) => {
    try {
        const deletedRows = await Employee.destroy({ where: { id: req.params.id } });
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        res.status(200).json({ message: 'Employee deleted successfully!' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error deleting employee.' });
    }
};

// @desc    Change current employee's password
exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const employeeId = req.user.id;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Old and new passwords are required.' });
    }
    try {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        const isMatch = await bcrypt.compare(oldPassword, employee.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password.' });
        }
        employee.password = newPassword;
        await employee.save();
        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Server error changing password.' });
    }
};

// @desc    Upload current employee's profile picture
exports.uploadProfilePicture = async (req, res) => {
    const employeeId = req.user.id;
    try {
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded.' });
        }
        const imageUrl = req.file.path; // This will be the Cloudinary URL
        employee.profilePictureUrl = imageUrl;
        await employee.save();
        res.status(200).json({ message: 'Profile picture updated successfully!', profilePictureUrl: imageUrl });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Server error uploading profile picture.' });
    }
};
