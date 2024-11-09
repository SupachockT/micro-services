const express = require('express');
const { shortenURL, fetchUrlHistory } = require('../controllers/urlController');

const router = express.Router();

router.post('/shorten', shortenURL);

router.get('/history', fetchUrlHistory)

module.exports = router;
