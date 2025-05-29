const express = require('express');
const fs = require('fs').promises; // Use promises-based fs
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
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
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'https://*.onrender.com'],
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const messagesFile = path.join(__dirname, 'messages.json');
const archivedMessagesFile = path.join(__dirname, 'archived_messages.json');

// Message validation
function validateMessage(message) {
    const { name, email, message: msg } = message;
    
    if (!name || !email || !msg) {
        return { valid: false, error: 'All fields are required' };
    }
    
    if (name.length < 2 || name.length > 100) {
        return { valid: false, error: 'Name must be between 2 and 100 characters' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Invalid email format' };
    }
    
    if (msg.length < 10 || msg.length > 1000) {
        return { valid: false, error: 'Message must be between 10 and 1000 characters' };
    }
    
    return { valid: true };
}

// Message sanitization
function sanitizeMessage(message) {
    return {
        ...message,
        name: message.name.trim().replace(/[<>]/g, ''),
        email: message.email.trim().toLowerCase(),
        message: message.message.trim().replace(/[<>]/g, '')
    };
}

// Ensure messages files exist
async function initializeMessagesFiles() {
    try {
        await fs.access(messagesFile);
        const data = await fs.readFile(messagesFile, 'utf8');
        JSON.parse(data);
    } catch (err) {
        await fs.writeFile(messagesFile, '[]');
    }

    try {
        await fs.access(archivedMessagesFile);
        const data = await fs.readFile(archivedMessagesFile, 'utf8');
        JSON.parse(data);
    } catch (err) {
        await fs.writeFile(archivedMessagesFile, '[]');
    }
}

// Initialize messages files
initializeMessagesFiles().catch(err => {
    console.error('Error initializing messages files:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Receive messages
app.post('/api/contact', async (req, res) => {
    console.log('Received contact request');
    
    try {
        const message = sanitizeMessage(req.body);
        const validation = validateMessage(message);
        
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        let messages = [];
        try {
            const data = await fs.readFile(messagesFile, 'utf8');
            messages = JSON.parse(data);
        } catch (err) {
            console.error('Error reading messages file:', err);
            messages = [];
        }

        const newMessage = {
            id: uuidv4(),
            ...message,
            status: 'new',
            date: new Date().toISOString(),
            read: false
        };
        
        messages.push(newMessage);
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        
        console.log('Message saved successfully:', newMessage.id);
        res.json({ 
            success: true, 
            message: 'Message sent successfully!',
            messageId: newMessage.id
        });
        
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

// Update message status
app.patch('/api/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, read } = req.body;
        
        const data = await fs.readFile(messagesFile, 'utf8');
        let messages = JSON.parse(data);
        
        const messageIndex = messages.findIndex(m => m.id === id);
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        if (status) messages[messageIndex].status = status;
        if (typeof read === 'boolean') messages[messageIndex].read = read;
        
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        res.json({ success: true, message: 'Message updated successfully' });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Server error updating message.' });
    }
});

// Archive message
app.post('/api/messages/:id/archive', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Read current messages
        const messagesData = await fs.readFile(messagesFile, 'utf8');
        let messages = JSON.parse(messagesData);
        
        // Find and remove message
        const messageIndex = messages.findIndex(m => m.id === id);
        if (messageIndex === -1) {
            return res.status(404).json({ error: 'Message not found' });
        }
        
        const message = messages[messageIndex];
        messages.splice(messageIndex, 1);
        
        // Read archived messages
        const archivedData = await fs.readFile(archivedMessagesFile, 'utf8');
        let archivedMessages = JSON.parse(archivedData);
        
        // Add to archived messages
        archivedMessages.push({
            ...message,
            archivedAt: new Date().toISOString()
        });
        
        // Save both files
        await Promise.all([
            fs.writeFile(messagesFile, JSON.stringify(messages, null, 2)),
            fs.writeFile(archivedMessagesFile, JSON.stringify(archivedMessages, null, 2))
        ]);
        
        res.json({ success: true, message: 'Message archived successfully' });
    } catch (error) {
        console.error('Error archiving message:', error);
        res.status(500).json({ error: 'Server error archiving message.' });
    }
});

// Get archived messages
app.get('/api/messages/archived', async (req, res) => {
    try {
        const data = await fs.readFile(archivedMessagesFile, 'utf8');
        const messages = JSON.parse(data);
        res.json(messages);
    } catch (error) {
        console.error('Error reading archived messages:', error);
        res.status(500).json({ error: 'Server error reading archived messages.' });
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