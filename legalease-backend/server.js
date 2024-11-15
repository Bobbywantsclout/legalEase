require('dotenv').config(); // Load environment variables
console.log('MONGODB_URI:', process.env.MONGODB_URI); // Add this line to debug

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import routes
const userRoutes = require('./routes/userRoutes'); // Import userRoutes

// Create an instance of Express
const app = express();
const port = process.env.PORT || 5000; // Use the PORT from environment variables or default to 5000

// Middleware
app.use(cors());
app.use(express.json());

// Ensure the 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create the 'uploads' directory if it doesn't exist
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Set up multer for file uploads with diskStorage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Give each file a unique name
    }
});

const upload = multer({ storage: storage });

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // If no token is provided, respond with "Unauthorized"

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // If the token is invalid or expired, respond with "Forbidden"
        
        req.user = user; // Attach the user object to the request
        next(); // Move to the next middleware/route handler
    });
};

// Link the user routes
app.use('/api', userRoutes); // Link to all user-related routes

// Route for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded successfully:', req.file);

    // Send success response
    res.send({
        message: 'File uploaded and saved successfully!',
        file: req.file.filename
    });
});

// Protected route example to fetch the authenticated user's profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password'); // Fetch the user by ID (excluding password)
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user); // Send user details as a response
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user', details: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
