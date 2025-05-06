const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Railway specific health check
app.get('/', (req, res) => {
    res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for the leaderboard data
let leaderboardData = [];

// API endpoint to get the leaderboard data
app.get('/api/leaderboard', (req, res) => {
    try {
        res.json(leaderboardData);
    } catch (error) {
        console.error('Error in GET /api/leaderboard:', error);
        res.status(500).json({ error: 'Failed to get leaderboard data' });
    }
});

// API endpoint to update the leaderboard data
app.post('/api/leaderboard', (req, res) => {
    try {
        const newData = req.body;
        if (Array.isArray(newData)) {
            // Store only top 100 users
            leaderboardData = newData.slice(0, 100);
            res.json({ success: true, message: 'Leaderboard updated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid data format' });
        }
    } catch (error) {
        console.error('Error in POST /api/leaderboard:', error);
        res.status(500).json({ error: 'Failed to update leaderboard data' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error loading page');
    }
});

// Get port from environment variable or use default
const port = process.env.PORT || 3000;

// Start server
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use`);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});