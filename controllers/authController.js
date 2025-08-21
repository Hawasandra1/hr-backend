// File: src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

// --- HELPER FUNCTION (No changes needed) ---
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};


// --- REGISTRATION (No changes needed, it's already correct) ---
const registerUser = async (req, res) => {
    // This function correctly creates an Employee
    try {
        const { firstName, lastName, email, password, position = 'Employee', role = 'Employee' } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'First Name, Last Name, email, and password are required' });
        }
        const existingEmployee = await Employee.findOne({ where: { email: email.toLowerCase() } });
        if (existingEmployee) {
            return res.status(400).json({ message: 'An employee with this email already exists' });
        }
        const employee = await Employee.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            position,
            role
        });
        const token = generateToken(employee.id);
        const employeeResponse = {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role,
        };
        res.status(201).json({
            message: 'Employee registered successfully',
            token,
            user: employeeResponse
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};


// --- LOGIN (APPLYING THE FIX) ---
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // --- THIS IS THE FIX ---
        // We now check the Employee model for the login attempt
        const employee = await Employee.findOne({ where: { email: email.toLowerCase().trim() } });

        if (!employee) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, employee.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(employee.id);
        const employeeResponse = {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role,
        };

        res.status(200).json({
            message: 'Login successful',
            token,
            user: employeeResponse
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// --- GET PROFILE (NEW SEPARATE FUNCTIONS) ---
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

const getEmployeeProfile = async (req, res) => {
    try {
        const employee = await Employee.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        res.status(200).json({ user: employee }); // keep 'user' key for frontend
    } catch (error) {
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};


// --- CHANGE PASSWORD (NEW SEPARATE FUNCTIONS) ---
const changeUserPassword = async (req, res) => {
    // This function for Admins remains the same
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) return res.status(400).json({ message: 'Current password is incorrect' });

        user.password = newPassword; // Let the beforeUpdate hook handle hashing
        await user.save();
        
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error changing password' });
    }
};

const changeEmployeePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const employee = await Employee.findByPk(req.user.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.password);
        if (!isCurrentPasswordValid) return res.status(400).json({ message: 'Current password is incorrect' });
        
        employee.password = newPassword; // Let the beforeUpdate hook handle hashing
        await employee.save();
        
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error changing password' });
    }
};


// Note: For simplicity, we are skipping the separate upload functions for now
// as they follow the exact same pattern. We can add them if needed.

// We are also keeping the registerAdminUser and logoutUser as they were, they are fine.
const registerAdminUser = async (req, res) => { /* ... your existing code ... */ };
const logoutUser = async (req, res) => { /* ... your existing code ... */ };


// --- FINAL STEP: UPDATE MODULE.EXPORTS ---
// Make sure to export all the new and renamed functions
module.exports = {
    registerUser,
    loginUser,
    registerAdminUser,
    logoutUser,
    // --- New Exports ---
    getUserProfile,
    getEmployeeProfile,
    changeUserPassword,
    changeEmployeePassword
};