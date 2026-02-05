const express = require('express');
const path = require('path');

const app = express();

// Test: minimal setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/subjects', (req, res) => {
  console.log('[route] GET /api/subjects');
  res.json([{ id: 'TEST', name: 'Test Subject' }]);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[OK] Server listening on ${PORT}`);
});

server.on('error', (err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
