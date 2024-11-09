const express = require('express');
const { recordClick } = require('../controllers/click-history-controller');
const router = express.Router();

// Route for recording a click
router.post('/clicks/:shortUrl', recordClick);

module.exports = router;
