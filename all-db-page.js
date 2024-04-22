// all-db-page.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const title = 'Welcom To All Table'
const database = 'mysql_node'
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'faizghazali.hopto.org',
    user: 'faiz',
    password: 'faiz',
    database: database
});

// Define route handler for the "Welcome to the All Database" page
router.get('/', (req, res) => {
    // Query to retrieve all tables in the database
    const query = 'SELECT table_name FROM information_schema.tables WHERE table_schema = ?';

    // Execute the query
    connection.query(query, ['mysql_node'], (err, results) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Extract table names from the query results
        const tables = results.map(result => result.table_name);

        // Generate the response body
        const responseBody = `<h1>Welcome to the All Table of ${database}</h1><h2>Tables: ${tables.join(', ')}</h2>`;

        // Check if the request wants JSON response
        if (req.headers['accept'] && req.headers['accept'].includes('application/json')) {
            // Send JSON response
            res.json({ message: 'Welcome to the All Table', tables });
        } else {
            // Send HTML response
            res.send(responseBody);
        }

        // Close the MySQL connection after sending the response
        
    });
});

module.exports = router;
