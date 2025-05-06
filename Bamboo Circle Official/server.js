const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for the leaderboard data
let leaderboardData = [];

// API endpoint to get the leaderboard data
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboardData);
});

// API endpoint to update the leaderboard data
app.post('/api/leaderboard', (req, res) => {
    const newData = req.body;
    if (Array.isArray(newData)) {
        // Store only top 100 users
        leaderboardData = newData.slice(0, 100);
        res.json({ success: true, message: 'Leaderboard updated successfully' });
    } else {
        res.status(400).json({ success: false, message: 'Invalid data format' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});