// Registration endpoint that matches your Employee model
const express = require('express');
const jwt = require('jsonwebtoken');
const { Employee } = require('../models'); // Adjust path as needed
const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        console.log('Registration request received:', {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            hasPassword: !!req.body.password
        });

        const { firstName, lastName, email, password, position, role } = req.body;

        // Validate required fields (matching your Employee model)
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                message: 'First name, last name, email, and password are required',
                missing: {
                    firstName: !firstName,
                    lastName: !lastName,
                    email: !email,
                    password: !password
                }
            });
        }

        // Additional validation
        if (firstName.trim().length < 2) {
            return res.status(400).json({
                message: 'First name must be at least 2 characters long'
            });
        }

        if (lastName.trim().length < 2) {
            return res.status(400).json({
                message: 'Last name must be at least 2 characters long'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters long'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: 'Please provide a valid email address'
            });
        }

        // Check if user already exists
        const existingUser = await Employee.findOne({ 
            where: { email: email.toLowerCase().trim() } 
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        }

        // Create new employee (password will be hashed by the model hook)
        const newEmployee = await Employee.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            position: position || 'Employee', // Default position
            role: role || 'Employee', // Default role
            status: 'active',
            hireDate: new Date()
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newEmployee.id, 
                email: newEmployee.email, 
                role: newEmployee.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Return user data (excluding password)
        const userData = {
            id: newEmployee.id,
            employeeId: newEmployee.employeeId,
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            email: newEmployee.email,
            role: newEmployee.role,
            position: newEmployee.position,
            status: newEmployee.status,
            hireDate: newEmployee.hireDate
        };

        console.log('Registration successful for:', userData.email);

        res.status(201).json({
            message: 'Registration successful',
            token: token,
            user: userData
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle Sequelize validation errors
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: validationErrors
            });
        }

        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            message: 'Internal server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'HR Backend API'
    });
});

module.exports = router;