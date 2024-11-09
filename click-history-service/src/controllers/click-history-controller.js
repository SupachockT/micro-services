const client = require('../database'); // Database connection

async function recordClick(req, res) {
    const { shortUrl } = req.params

    try {
        const shortUrlQuery = 'SELECT id FROM short_urls WHERE short_url = $1';
        const shortUrlResult = await client.query(shortUrlQuery, [shortUrl]);

        if (shortUrlResult.rows.length === 0) {
            return res.status(404).json({ error: 'Short URL not found' });
        }

        const shortUrlId = shortUrlResult.rows[0].id;

        const checkHistoryQuery = 'SELECT id, click_time FROM click_history WHERE short_url_id = $1';
        const checkHistoryResult = await client.query(checkHistoryQuery, [shortUrlId]);

        if (checkHistoryResult.rows.length > 0) {
            const updateClickQuery = `
                UPDATE click_history
                SET click_time = click_time + 1,
                    last_clicked_time = NOW()
                WHERE short_url_id = $1
            `;
            await client.query(updateClickQuery, [shortUrlId]);
        } else {
            // If no click history exists, insert a new row with click_time = 1
            const insertClickQuery = `
                INSERT INTO click_history (short_url_id, click_time, last_clicked_time)
                VALUES ($1, 1, NOW())
            `;
            await client.query(insertClickQuery, [shortUrlId]);
        }

        res.status(201).json({ message: 'Click recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { recordClick };
