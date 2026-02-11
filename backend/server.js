const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Video Verification API is running');
});

// Database Connection (Mock or Real)
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://autoVideoDetection:autoVideoDetection@auto-video-detectioin.k7epgon.mongodb.net/?appName=Auto-Video-Detectioin';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
