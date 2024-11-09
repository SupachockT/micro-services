const express = require('express');
const cors = require('cors');
const redirectRoutes = require('./src/routes/redirectRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

app.use(redirectRoutes);

app.listen(port, () => {
    console.log(`Redirect service is running on http://localhost:${port}`);
});
