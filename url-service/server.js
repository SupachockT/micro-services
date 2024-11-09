const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const urlRoutes = require('./src/routes/urlRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

app.use(bodyParser.json());

app.use(urlRoutes);

app.listen(port, () => {
    console.log(`URL Service running at http://localhost:${port}`);
});