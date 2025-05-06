const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Railway specific health check with detailed response
app.get('/', (req, res) => {
    console.log('Health check requested');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for the leaderboard data
let leaderboardData = [];

// API endpoint to get the leaderboard data
app.get('/api/leaderboard', (req, res) => {
    console.log('GET /api/leaderboard requested');
    try {
        res.json(leaderboardData);
    } catch (error) {
        console.error('Error in GET /api/leaderboard:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Failed to get leaderboard data' });
    }
});

// API endpoint to update the leaderboard data
app.post('/api/leaderboard', (req, res) => {
    console.log('POST /api/leaderboard requested');
    try {
        const newData = req.body;
        if (Array.isArray(newData)) {
            // Store only top 100 users
            leaderboardData = newData.slice(0, 100);
            console.log(`Updated leaderboard with ${leaderboardData.length} users`);
            res.json({ success: true, message: 'Leaderboard updated successfully' });
        } else {
            console.error('Invalid data format received:', typeof newData);
            res.status(400).json({ success: false, message: 'Invalid data format' });
        }
    } catch (error) {
        console.error('Error in POST /api/leaderboard:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Failed to update leaderboard data' });
    }
});

// Health check endpoint with detailed response
app.get('/health', (req, res) => {
    console.log('Health check requested');
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    console.log(`Serving index.html for ${req.url}`);
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        console.error('Stack:', error.stack);
        res.status(500).send('Error loading page');
    }
});

// Get port from environment variable or use default
const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Memory usage:`, process.memoryUsage());
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    console.error('Stack:', error.stack);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    console.error('Stack:', reason.stack);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});