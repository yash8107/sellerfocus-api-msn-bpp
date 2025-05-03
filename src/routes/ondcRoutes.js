const express = require('express');
const router = express.Router();
const ondcRegistrationController = require('../controllers/ondcRegistrationController');

// Key Generation
router.post('/generate-keys', ondcRegistrationController.generateKeys);

module.exports = router;