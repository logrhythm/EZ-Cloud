const express = require('express');
const https = require('https');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const httpsKey = fs.readFileSync(path.join(__dirname, '..', 'config', 'https.key.pem'));
const httpsCert = fs.readFileSync(path.join(__dirname, '..', 'config', 'https.cert.pem'));

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();
const httpsServer = https.createServer({ key: httpsKey, cert: httpsCert }, app);

app.use(morgan('dev'));
// Getting rid of contentSecurityPolicy for now, as it forces it to use HTTPS (which we don't have)
// app.use(helmet({ contentSecurityPolicy: false }));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({
    message: '👋 All good mate'
  });
});

app.use('/api/v1', api);

// Static web site hosting:
// - First, the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_web_root', 'index.html'));
});
// - Second, all the other files/pages
app.get('/:file(*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_web_root', req.params.file));
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// module.exports = app;
module.exports = httpsServer;
