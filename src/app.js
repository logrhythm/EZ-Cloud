const express = require('express');
const https = require('https');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const httpsKey = fs.readFileSync(path.join(process.env.baseDirname, 'config', 'https.key.pem'));
const httpsCert = fs.readFileSync(path.join(process.env.baseDirname, 'config', 'https.cert.pem'));

const app = express();

// eslint-disable-next-line max-len
const httpsServer = https.createServer({ key: httpsKey, cert: httpsCert }, app);
const io = require('socket.io')(httpsServer, {
  cors: {
    origin: ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:8400', 'https://localhost:8400'],
    methods: ['GET', 'POST']
  }
});

const { isValidAuth, socketConnect } = require('./socket');

io.use(isValidAuth);
io.on('connection', socketConnect);

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const middlewares = require('./middlewares');
const api = require('./api');

// Check for JWT token in the headers, and if found populate the req object accordingly
app.use(middlewares.checkJwTokenAndSetUser);

app.get('/test', (req, res) => {
  res.json({
    message: '👋 All good mate'
  });
});

app.use('/api/v1', api);

// Static web site hosting:
// - First, the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(process.env.baseDirname, 'src', 'public_web_root', 'index.html'));
});
// - Second, all the other files/pages
app.get('/:file(*)', (req, res) => {
  res.sendFile(path.join(process.env.baseDirname, 'src', 'public_web_root', req.params.file));
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = httpsServer;
