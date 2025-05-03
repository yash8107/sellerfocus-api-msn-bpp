const express = require('express');
const router = express.Router();
const ondcRegistrationController = require('../controllers/ondcRegistrationController');

// Key Generation
router.post('/generate-keys', (req, res, next) => {
    console.log('Generate Keys Route Hit');
    next();
}, ondcRegistrationController.generateKeys);

module.exports = router;