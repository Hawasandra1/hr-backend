const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register User - FIXED VERSION (no double hashing)
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role = 'Employee' } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        // REMOVED: Manual password hashing - let the model hook handle it
        // Create user - password will be hashed by beforeCreate hook
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: password, // Pass plain password, hook will hash it
            role: role
        });

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login User (unchanged - this was working fine)
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        console.log('Login attempt for email:', email);

        // Find user by email
        const user = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Remove password from response
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        console.log('Login successful for:', email, 'Role:', user.role);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get Current User Profile
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Server error retrieving profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Register Admin User - FIXED VERSION (no double hashing)
const registerAdminUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validation
        if (!username || !email || !password || !role) {
            return res.status(400).json({ 
                message: 'All fields are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        // REMOVED: Manual password hashing - let the model hook handle it
        // Create user - password will be hashed by beforeCreate hook
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: password, // Pass plain password, hook will hash it
            role: role
        });

        // Remove password from response
        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({
            message: 'Admin user created successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({ 
            message: 'Server error during admin registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Change Password (keep manual hashing since it's not using User.create())
const changeUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        // Find user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await user.update({ password: hashedNewPassword });

        res.status(200).json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            message: 'Server error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Upload Profile Picture
const uploadUserProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const imageUrl = req.file.path; // Cloudinary URL

        // Update user profile picture
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ profilePicture: imageUrl });

        res.status(200).json({
            message: 'Profile picture uploaded successfully',
            profilePicture: imageUrl
        });

    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ 
            message: 'Server error uploading profile picture',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout User (optional - for token blacklisting)
const logoutUser = async (req, res) => {
    try {
        // For now, just send success response
        // In a more advanced setup, you might blacklist the token
        res.status(200).json({ 
            message: 'Logout successful' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'Server error during logout' 
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    registerAdminUser,
    changeUserPassword,
    uploadUserProfilePicture,
    logoutUser
};