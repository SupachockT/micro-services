const axios = require('axios');
const client = require('../database');

async function redirectToOriginalURL(req, res) {
    const { shortUrl } = req.params;

    try {
        // First, get the original_url_id from the short_urls table using the decoded short URL ID
        const queryShortUrl = 'SELECT original_url_id FROM short_urls WHERE short_url = $1';
        const resultShortUrl = await client.query(queryShortUrl, [shortUrl]);

        if (resultShortUrl.rows.length > 0) {
            const originalUrlId = resultShortUrl.rows[0].original_url_id;

            // Now, fetch the original_url using the original_url_id from the original_urls table
            const queryOriginalUrl = 'SELECT original_url FROM original_urls WHERE id = $1';
            const resultOriginalUrl = await client.query(queryOriginalUrl, [originalUrlId]);

            if (resultOriginalUrl.rows.length > 0) {
                const originalUrl = resultOriginalUrl.rows[0].original_url;
                await axios.post(`http://localhost:3002/clicks/${shortUrl}`);
                res.redirect(originalUrl);
            } else {
                res.status(404).json({ error: 'Original URL not found' });
            }
        } else {
            res.status(404).json({ error: 'Short URL not found' });
        }
    } catch (error) {
        console.error('Error in redirecting to original URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { redirectToOriginalURL };
