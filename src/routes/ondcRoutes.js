const express = require('express');
const router = express.Router();
const ondcRegistrationController = require('../controllers/ondcRegistrationController');

// Key Generation
router.post('/generate-keys', ondcRegistrationController.generateKeys);

// Subscription
router.post('/subscribe', ondcRegistrationController.subscribe);

// Lookup
router.post('/lookup', ondcRegistrationController.lookup);

module.exports = router;