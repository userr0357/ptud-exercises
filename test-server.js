const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/test', (req, res) => {
  res.json({ message: 'test ok' });
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Test server on 3001');
});
