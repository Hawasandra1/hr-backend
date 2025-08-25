// File: src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

// --- HELPER FUNCTION (No changes needed) ---
const generateToken = (userId, userType) => { // <-- Add userType
    return jwt.sign(
        { userId, userType }, // <-- Add userType to the payload
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const cleanEmail = email.toLowerCase().trim();
        console.log('Login attempt for email:', cleanEmail);

        // Step 1: Look for the user in the Employee table first
        let account = await Employee.findOne({ where: { email: cleanEmail } });
        let accountType = 'Employee';

        // Step 2: If not found as an Employee, look in the User table
        if (!account) {
            account = await User.findOne({ where: { email: cleanEmail } });
            accountType = 'User';
        }

        // Step 3: If not found in either table, deny access
        if (!account) {
            console.log('Account not found in either table:', cleanEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Step 4: Check the password
        const isPasswordValid = await bcrypt.compare(password, account.password);
        if (!isPasswordValid) {
            console.log('Invalid password for:', cleanEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Step 5: Generate a token with the correct type
        const token = generateToken(account.id, accountType);

        // Step 6: Create the correct response object based on the account type
        let userResponse;
        if (accountType === 'Employee') {
            userResponse = {
                id: account.id,
                firstName: account.firstName,
                lastName: account.lastName,
                email: account.email,
                role: account.role,
            };
        } else { // It's a User (Admin/HR)
            userResponse = {
                id: account.id,
                username: account.username, // Users have a username
                email: account.email,
                role: account.role,
            };
        }

        console.log('Login successful for:', account.email, 'Role:', account.role, 'Type:', accountType);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};


// --- EMPLOYEE REGISTRATION ---
const registerUser = async (req, res) => {
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
        const token = generateToken(employee.id, 'Employee'); // Pass type on registration
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


// We are also keeping the registerAdminUser and logoutUser as they were, they are fine.
const registerAdminUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: 'Username, email, password, and role are required' });
        }
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            return res.status(409).json({ message: 'A user with this email already exists' });
        }
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password,
            role
        });
        res.status(201).json({ 
            message: `${role} user registered successfully`,
            user: { id: user.id, username: user.username, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ message: 'Server error during admin registration' });
    }
};

const logoutUser = async (req, res) => {
    try {
        console.log('User logout request received. Token will be cleared by client.');
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }

};
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