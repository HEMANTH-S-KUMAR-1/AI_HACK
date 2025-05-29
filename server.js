const express = require('express');
const fs = require('fs').promises; // Use promises-based fs
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure CORS with more specific settings
app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const messagesFile = path.join(__dirname, 'messages.json');

// Ensure messages file exists
async function initializeMessagesFile() {
    try {
        await fs.access(messagesFile);
        // Verify file is valid JSON
        const data = await fs.readFile(messagesFile, 'utf8');
        JSON.parse(data); // This will throw if not valid JSON
        console.log('Messages file exists and is valid JSON');
    } catch (err) {
        console.log('Creating or fixing messages file');
        await fs.writeFile(messagesFile, '[]');
    }
}

// Initialize messages file
initializeMessagesFile().catch(err => {
    console.error('Error initializing messages file:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Receive messages
app.post('/api/contact', async (req, res) => {
    console.log('Received contact request');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    try {
        const { name, email, message } = req.body;
        
        // Validate input
        if (!name || !email || !message) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'All fields required.' });
        }

        // Read existing messages
        let messages = [];
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            console.error('Error reading messages file:', err);
            messages = [];
        }

        // Add new message
        const newMessage = {
            name,
            email,
            message,
            date: new Date().toISOString()
        };
        
        messages.push(newMessage);
        
        // Save messages
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        
        console.log('Message saved successfully');
        res.json({ success: true, message: 'Message sent successfully!' });
        
    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ error: 'Server error processing message.' });
    }
});

// Read messages (admin)
app.get('/api/messages', async (req, res) => {
    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        const messages = JSON.parse(data);
        res.json(messages);
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ error: 'Server error reading messages.' });
    }
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    res.status(statusCode).json({ 
        error: message,
        status: statusCode,
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('CORS enabled for all origins');
});

// Handle server errors
server.on('error', (error) => {
    console.error('Server error:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});