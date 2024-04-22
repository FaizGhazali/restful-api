// Import required libraries
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'faizghazali.hopto.org',
  user: 'faiz',
  password: 'faiz',
  database: 'mysql_node'
});

// Close MySQL connection after 30 seconds of inactivity
const DISCONNECT_INTERVAL = 30 * 1000; // 30 seconds in milliseconds

let disconnectTimer;

function startDisconnectTimer() {
  disconnectTimer = setTimeout(() => {
    console.log('Disconnecting from MySQL due to inactivity');
    connection.end(err => {
      if (err) {
        console.error('Error disconnecting from MySQL: ' + err.stack);
        return;
      }
      console.log('Disconnected from MySQL');
    });
  }, DISCONNECT_INTERVAL);
}

function resetDisconnectTimer() {
  clearTimeout(disconnectTimer);
  startDisconnectTimer();
}

// Connect to MySQL
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
  
  // Start the disconnect timer after connection
  startDisconnectTimer();
});

// Middleware to reset the disconnect timer on every incoming request
app.use((req, res, next) => {
  resetDisconnectTimer();
  next();
});

// Middleware to reset the disconnect timer on every successful response
app.use((req, res, next) => {
  res.on('finish', () => {
    resetDisconnectTimer();
  });
  next();
});

// Create Express app
const app = express();
const PORT = 6969;

// Middleware to parse JSON body
app.use(bodyParser.json());

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

app.delete('/api/data',(req,res)=>{
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
