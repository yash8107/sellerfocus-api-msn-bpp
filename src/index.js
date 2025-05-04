const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require("dotenv").config();
const ondcRoutes = require('./routes/ondcRoutes');
const ondcRegistrationController = require('./controllers/ondcRegistrationController');
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT;

app.get('/', (req,res) => {
    res.send("hello world");
})
// ONDC Routes
app.use('/ondc', ondcRoutes);
// Site Verification Route
app.get('/ondc-site-verification.html', ondcRegistrationController.siteVerification);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong',
        message: err.message
    });
});
// // Beckn Routes
// app.use('/api/beckn', becknRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
