const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');

const app = express();

const sslOptions = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

app.use(express.static(path.join(__dirname, 'public')));

// https.createServer(sslOptions, app).listen(443, () => {
//   console.log('HTTPS server running at https://localhost/');
// });
