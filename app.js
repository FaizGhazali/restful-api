// Import required libraries
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const allDbPageRouter = require('./all-db-page');

// Create MySQL connection
let connection;

function connectToMySQL() {
  connection = mysql.createConnection({
    host: 'faizghazali.hopto.org',
    user: 'faiz',
    password: 'faiz',
    database: 'mysql_node'
  });

  // Attempt to connect to MySQL
  connection.connect(err => {
    if (err) {
      console.error('Error connecting to MySQL: ' + err.stack);
      // Retry connecting after a timeout
      setTimeout(connectToMySQL, 5000); // Retry after 5 seconds
      return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
  });

  // Handle MySQL errors
  connection.on('error', err => {
    console.error('MySQL connection error: ' + err.stack);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      // Reconnect if connection is lost
      connectToMySQL();
    } else {
      throw err;
    }
  });
}

// Start connecting to MySQL
connectToMySQL();

// Create Express app
const app = express();
const PORT = 6969;

// Middleware to parse JSON body
app.use(bodyParser.json());
app.use('/all-db-page', allDbPageRouter);

// Define a route to fetch user data
app.get('/users', (req, res) => {
  // Query to fetch user data from the database
  const query = 'SELECT * FROM monsters';

  // Execute the query
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Send the user data as JSON response
    res.json(results);
  });
});

// Define a route to add new data to the table
app.post('/api/data', (req, res) => {
  const newDataArray = req.body;

  // Check if the request body is an array
  if (!Array.isArray(newDataArray)) {
    res.status(400).json({ error: 'Request body must be an array of objects' });
    return;
  }

  // Array to store IDs of inserted rows
  const insertedIds = [];

  // Iterate over each object in the array and insert into the database
  newDataArray.forEach(newData => {
    connection.query('INSERT INTO monsters SET ?', newData, (err, result) => {
      if (err) {
        console.error('Error executing MySQL query: ' + err.stack);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Store the ID of the inserted row
      insertedIds.push(result.insertId);

      // If all data has been inserted, send a success response
      if (insertedIds.length === newDataArray.length) {
        res.status(201).json({ message: 'Data added successfully', insertedIds });
      }
    });
  });
});

app.delete('/api/data', (req, res) => {
  const query = 'DELETE FROM monsters;';
  connection.query(query, (err, result) => {
    if (err) {
      console.error('Error executing MySQL query: ' + err.stack);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Send a success response
    res.status(200).json({ message: 'All data deleted successfully' });
  });

});




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
