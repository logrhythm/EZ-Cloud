const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
// Getting rid of contentSecurityPolicy for now, as it forces it to use HTTPS (which we don't have)
app.use(helmet({ contentSecurityPolicy: false }));
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

module.exports = app;
