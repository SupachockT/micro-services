require('dotenv').config();
const { Client } = require('pg');

function createClient() {
  const client = new Client({
    connectionString: process.env.DB_CONNECTION_STRING,
    keepAlive: true,  // Keep the connection alive
    tcpKeepAlive: true,  // Enable TCP keep-alive
    keepAliveInitialDelayMillis: 0,  // Optional: Delay before sending keep-alive probes
  });

  client.connect()
    .then(() => {
      console.log('Connected to PostgreSQL database');
    })
    .catch((err) => {
      console.error('Connection error', err.stack);
      setTimeout(createClient, 5000); // Retry connection after 5 seconds
    });

  // Handle client disconnection or error events
  client.on('end', () => {
    console.log('Postgres connection closed. Attempting reconnect...');
    setTimeout(createClient, 5000); // Retry connection after 5 seconds
  });

  return client;
}

const client = createClient();

module.exports = client;
