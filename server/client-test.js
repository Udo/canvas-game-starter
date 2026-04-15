// Simple WebSocket client test
// Run this with: node client-test.js

const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected to WebSocket server');
  
  // Send a test message
  ws.send(JSON.stringify({
    type: 'test',
    message: 'Hello from client!',
    timestamp: new Date().toISOString()
  }));
  
  // Send another message after 2 seconds
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'ping',
      data: 'Keep alive message'
    }));
  }, 2000);
});

ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log('Received from server:', message);
  } catch (error) {
    console.log('Received raw data:', data.toString());
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

// Keep the process alive
console.log('WebSocket client started. Press Ctrl+C to exit.');

process.on('SIGINT', () => {
  console.log('\nClosing connection...');
  ws.close();
  process.exit(0);
});
