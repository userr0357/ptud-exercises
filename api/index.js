const serverless = require('serverless-http');
const app = require('../server');

// serverless-http returns a handler compatible with Node serverless platforms
const handler = serverless(app);

module.exports = (req, res) => handler(req, res);
