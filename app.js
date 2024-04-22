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

// Reset the disconnect timer on every incoming request
app.use((req, res, next) => {
  resetDisconnectTimer();
  next();
});

// Reset the disconnect timer on every successful response
app.use((req, res, next) => {
  res.on('finish', () => {
    resetDisconnectTimer();
  });
  next();
});
