require('dotenv').config();
const path = require('path');
const express = require('express');
const Connection=require("./config/db.js");
Connection();
const cors = require('cors');
const initRoutes = require("./routes");

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initRoutes(app);

// Middleware assign default status of not status is set
app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (body) {
    // Default to 200 if no status is set
    if (!res.statusCode || res.statusCode === 200) {
      res.status(200);
    }
    return originalSend.call(this, body);
  };

  next();
});

// Example route
app.get('/api', (req, res) => {
  try{
    throw new Error('not implemented');
  }
  catch (err){
    console.log("handled error")
  }
  res.send({ message: "handled error" });
});

// Error handling middleware
// Default response code 500 if unhandled error
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// // Catch-all route for handling 404 errors
// app.use((req, res, next) => {
//   res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
// });

app.listen(PORT, () => {
  console.info(`Server is running on PORT: ${PORT}`);
});
