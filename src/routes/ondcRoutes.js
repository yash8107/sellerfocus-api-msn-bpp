const express = require('express');
const router = express.Router();
const ondcRegistrationController = require('../controllers/ondcRegistrationController');

// Debugging route logging
router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.path}`);
    next();
});

// Key Generation
router.post('/generate-keys', ondcRegistrationController.generateKeys);

// Subscription
router.post('/subscribe', ondcRegistrationController.subscribe);

// Lookup
router.post('/lookup', ondcRegistrationController.lookup);

// Callback Endpoint
router.post('/on_subscribe', ondcRegistrationController.onSubscribeCallback);

module.exports = router;