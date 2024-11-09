const client = require('../database');
const { encodeBase62 } = require('../utils/base62');

async function shortenURL(req, res) {
    const { original_url, custom_url } = req.body;

    try {
        let newUrlId;
        let shortUrl;

        const checkUrlQuery = 'SELECT id FROM original_urls WHERE original_url = $1';
        const result = await client.query(checkUrlQuery, [original_url]);

        if (result.rows.length > 0) {
            newUrlId = result.rows[0].id;
        } else {
            const insertUrlQuery = 'INSERT INTO original_urls (original_url) VALUES ($1) RETURNING id';
            const insertResult = await client.query(insertUrlQuery, [original_url]);
            newUrlId = insertResult.rows[0].id;
        }

        if (custom_url) {
            const checkCustomUrlQuery = 'SELECT * FROM short_urls WHERE short_url = $1';
            const customUrlResult = await client.query(checkCustomUrlQuery, [custom_url]);

            if (customUrlResult.rows.length > 0) {
                return res.status(400).json({ error: 'Custom URL already exists. Please choose another.' });
            }

            shortUrl = custom_url;
        } else {
            // Generate a short URL using base62 encoding if no custom URL is provided
            const lastShortUrlQuery = 'SELECT id FROM short_urls ORDER BY id DESC LIMIT 1';
            const lastShortUrlResult = await client.query(lastShortUrlQuery);

            // If no short URL exists, start from 1
            const newShortUrlId = lastShortUrlResult.rows.length > 0
                ? lastShortUrlResult.rows[0].id + 1
                : 1;

            shortUrl = encodeBase62(newShortUrlId);
        }

        // Insert the new short URL into the short_urls table
        const insertShortUrlQuery = 'INSERT INTO short_urls (original_url_id, short_url) VALUES ($1, $2) RETURNING id';
        const insertShortUrlResult = await client.query(insertShortUrlQuery, [newUrlId, shortUrl]);

        // Insert a click history record with initial values for the new short URL
        const shortUrlId = insertShortUrlResult.rows[0].id;
        const insertClickHistoryQuery = 'INSERT INTO click_history (short_url_id, click_time) VALUES ($1, $2)';
        await client.query(insertClickHistoryQuery, [shortUrlId, 0]);

        // Respond with the generated or custom short URL
        res.status(201).json({ short_url: shortUrl });

    } catch (error) {
        console.error('Error in shortening URL:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function fetchUrlHistory(req, res) {
    try {
        const query = `
            SELECT ou.original_url, su.short_url, ch.click_time, ch.last_clicked_time
            FROM original_urls ou
            LEFT JOIN short_urls su ON ou.id = su.original_url_id
            LEFT JOIN click_history ch ON su.id = ch.short_url_id
            ORDER BY ou.original_url, su.short_url;
        `;
        const result = await client.query(query);

        const historyData = result.rows.reduce((acc, row) => {
            if (!acc[row.original_url]) {
                acc[row.original_url] = {
                    short_urls: {},
                };
            }

            acc[row.original_url].short_urls[row.short_url] = {
                click_time: row.click_time,
                last_clicked_time: row.last_clicked_time,
            };

            return acc;
        }, {});

        const formattedHistory = Object.entries(historyData).map(([original_url, data]) => ({
            original_url,
            short_urls: Object.entries(data.short_urls).map(([short_url, shortData]) => ({
                short_url,
                click_time: shortData.click_time,
                last_clicked_time: shortData.last_clicked_time,
            })),
        }));

        res.status(200).json({ history: formattedHistory });
    } catch (error) {
        console.error('Error fetching all URL history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { shortenURL, fetchUrlHistory };