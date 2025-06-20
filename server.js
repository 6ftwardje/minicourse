const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the video page
app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, 'video.html'));
});

// Handle form submissions
app.post('/submit-form', (req, res) => {
    console.log('Form submitted:', req.body);
    // Here you can add logic to handle the form data
    // For now, just return a success response
    res.json({ success: true, message: 'Form submitted successfully' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and navigate to: http://localhost:${PORT}`);
}); 