require('dotenv').config();

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const db = require('./models');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// --- WebSocket Server Setup ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.locals.wss = wss;
app.locals.broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// --- Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    'https://hr-frontend-9gfc.onrender.com',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
}));

// --- Static File Serving ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Health Check Route ---
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// --- DEBUG: Import Routes One by One ---
console.log('Loading authRoutes...');
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
    console.log('✅ authRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading authRoutes:', error.message);
    process.exit(1);
}

console.log('Loading departmentRoutes...');
try {
    const departmentRoutes = require('./routes/departmentRoutes');
    app.use('/api/departments', departmentRoutes);
    console.log('✅ departmentRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading departmentRoutes:', error.message);
    process.exit(1);
}

console.log('Loading employeeRoutes...');
try {
    const employeeRoutes = require('./routes/employeeRoutes');
    app.use('/api/employees', employeeRoutes);
    console.log('✅ employeeRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading employeeRoutes:', error.message);
    process.exit(1);
}

console.log('Loading dashboardRoutes...');
try {
    const dashboardRoutes = require('./routes/dashboardRoutes');
    app.use('/api/dashboard', dashboardRoutes);
    console.log('✅ dashboardRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading dashboardRoutes:', error.message);
    process.exit(1);
}

console.log('Loading payslipRoutes...');
try {
    const payslipRoutes = require('./routes/payslipRoutes');
    app.use('/api/payslips', payslipRoutes);
    console.log('✅ payslipRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading payslipRoutes:', error.message);
    process.exit(1);
}

console.log('Loading leaveRoutes...');
try {
    const leaveRoutes = require('./routes/leaveRoutes');
    app.use('/api/leaves', leaveRoutes);
    console.log('✅ leaveRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading leaveRoutes:', error.message);
    process.exit(1);
}

console.log('Loading projectRoutes...');
try {
    const projectRoutes = require('./routes/projectRoutes');
    app.use('/api/projects', projectRoutes);
    console.log('✅ projectRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading projectRoutes:', error.message);
    process.exit(1);
}

console.log('All routes loaded, setting up error handlers...');

console.log('Setting up error handling middleware...');
// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

console.log('Setting up 404 handler...');
// --- 404 Handler ---
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

console.log('All middleware set up, starting server...');

// --- Database Connection and Server Start ---
const startServer = async () => {
    try {
        await db.sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Database: ${process.env.DB_NAME || 'hr_db'}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});