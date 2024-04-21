// Require the mysql package
const mysql = require('mysql');

// Create a connection pool
const pool = mysql.createPool({
    connectionLimit: 10, // Adjust as needed
    host: '192.168.1.106', // Replace with your MySQL host without the port number
    user: 'paw', // Replace with your MySQL user
    password: 'paw', // Replace with your MySQL password
    database: 'mysql_node' // Replace with your MySQL database
});

// Execute a query
pool.query('SELECT * FROM tasks', (error, results, fields) => {
    if (error) {
        console.error('Error executing query:', error);
        return;
    }
    console.log('Query results:', results);
});

// Setting a timeout for the query execution (for example, 30 seconds)
const queryTimeout = 30000; // in milliseconds
setTimeout(() => {
    pool.end((err) => {
        if (err) {
            console.error('Error ending the pool:', err);
        } else {
            console.log('Pool has been closed due to query timeout.');
        }
    });
}, queryTimeout);
