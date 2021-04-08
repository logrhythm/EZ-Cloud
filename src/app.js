const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public_web_root/index.html');
});

app.get('/test', (req, res) => {
  res.json({
    message: '👋 All good mate'
  });
});

app.use('/api/v1', api);

app.get('/:file(*)', (req, res) => {
  res.sendFile(__dirname + '/public_web_root/' + req.params.file);
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
