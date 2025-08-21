const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Protect middleware - verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- THIS IS THE FIX ---
        // We now check the userType from the token to decide which model to use
        let currentUser;
        if (decoded.userType === 'Employee') {
            currentUser = await Employee.findByPk(decoded.userId, {
                attributes: { exclude: ['password'] }
            });
        } else { // Assumes 'User' or any other type
            currentUser = await User.findByPk(decoded.userId, {
                attributes: { exclude: ['password'] }
            });
        }
        
        if (!currentUser) {
            return res.status(401).json({ message: 'Access denied. User not found.' });
        }

        // Add user to request object
        req.user = currentUser;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Access denied. Invalid token.' 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Access denied. Token expired.' 
            });
        } else {
            return res.status(500).json({ 
                message: 'Server error in authentication',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

// Authorize middleware - check user roles
const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Access denied. User not authenticated.' 
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ 
                    message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}` 
                });
            }

            next();
        } catch (error) {
            console.error('Authorization middleware error:', error);
            res.status(500).json({ 
                message: 'Server error in authorization' 
            });
        }
    };
};

// Optional: Admin only middleware (shorthand)
const adminOnly = (req, res, next) => {
    authorize('Admin')(req, res, next);
};

// Optional: HR and Admin middleware (shorthand)
const hrOrAdmin = (req, res, next) => {
    authorize('Admin', 'HR')(req, res, next);
};

// Optional: Manager, HR and Admin middleware (shorthand)
const managerOrAbove = (req, res, next) => {
    authorize('Admin', 'HR', 'Manager')(req, res, next);
};

module.exports = {
    protect,
    authorize,
    adminOnly,
    hrOrAdmin,
    managerOrAbove
};