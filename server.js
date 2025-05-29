const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3001', 'https://ai-hack-1.onrender.com', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(__dirname));

// Contact endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newMessage = {
            id: uuidv4(),
            name,
            email,
            message,
            date: new Date().toISOString()
        };

        // Save message
        const messagesFile = path.join(__dirname, 'messages.json');
        let messages = [];
        
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            // File doesn't exist yet, that's okay
        }

        messages.push(newMessage);
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));

        res.json({ 
            success: true, 
            message: 'Message sent successfully!'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messagesFile = path.join(__dirname, 'messages.json');
        let messages = [];
        
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            // File doesn't exist yet, that's okay
        }

        res.json(messages);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});