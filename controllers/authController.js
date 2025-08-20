// Register User - FIXED VERSION
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

// Register Admin User - FIXED VERSION
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