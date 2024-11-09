const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const clickHistoryRoutes = require('./src/routes/click-history-routes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

app.use(clickHistoryRoutes);

app.listen(port, () => {
    console.log(`Click History Service running on port ${port}`);
});
