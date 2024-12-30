require('dotenv').config();
const path = require('path');
const express = require('express');
const Connection = require("./config/db.js");
Connection();
const cors = require('cors');
const initRoutes = require("./routes");
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    methods: [],
    allowedHeaders: [],
    exposedHeaders: [],
    credentials: true
};
app.use(cors(corsOptions));

// Serve static files from the "public" directory
app.use('/uploads/photos', express.static(path.join(__dirname, 'public/uploads/photos')));
// Adjust body size limits for JSON and URL-encoded payloads
app.use(express.json({ limit: '50mb' })); // Set limit for JSON payload
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Set limit for URL-encoded payload

initRoutes(app);

// Default response if no status is set
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function (body) {
        if (!res.statusCode || res.statusCode === 200) {
            res.status(200);
        }
        return originalSend.call(this, body);
    };
    next();
});

// Example route
app.get('/api', (req, res) => {
    try {
        throw new Error('not implemented');
    } catch (err) {
        console.log("handled error")
    }
    res.send({ message: "handled error" });
});

// Central error handling middleware
app.use((err, req, res, next) => {
    // Check for Multer-specific errors
    if (err instanceof multer.MulterError) {
        console.log(err.stack);
        // Handle different Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send({ error: 'File size is too large!' });
        } else if (err.code === 'LIMIT_FIELD_COUNT') {
            return res.status(400).send({ error: 'Too many files uploaded!' });
        } else if (err.message.includes("Unexpected field")) {
            return res.status(400).send({ error: 'Unexpected field in file upload!' });
        } else {
            return res.status(400).send({ error: err.message });
        }
    }

    // General error handler
    console.error(err.stack);
    if (!res.headersSent) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});

// Catch-all route for handling 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'html', '404.html'));
});

app.listen(PORT, () => {
    console.info(`Server is running on PORT: ${PORT}`);
});
