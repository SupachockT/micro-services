const express = require('express');
const { redirectToOriginalURL } = require('../controllers/redirectController');

const router = express.Router();

router.get('/shortto/:shortUrl', redirectToOriginalURL);

module.exports = router;