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

const app = express();
// eslint-disable-next-line max-len
// const httpsServer = (process.env.DEV ? null : https.createServer({ key: httpsKey, cert: httpsCert }, app));
// const io = (process.env.DEV ? require('socket.io') : require('socket.io')(httpsServer));

// eslint-disable-next-line max-len
const httpsServer = https.createServer({ key: httpsKey, cert: httpsCert }, app);
const io = require('socket.io')(httpsServer, {
  cors: {
    origin: ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:8400', 'https://localhost:8400'],
    methods: ['GET', 'POST']
  }});

app.use(morgan('dev'));
app.use(helmet());
// if (process.env.DEV) {
//   app.use(cors({ origin: ['http://localhost:8080', 'https://localhost:8080', 'http://localhost:8400', 'https://localhost:8400'] }));
// } else {
//   app.use(cors());
// }
app.use(cors());
app.use(express.json());

const middlewares = require('./middlewares');
const api = require('./api');

// process.socket = { io: {} };
const socketConnect = require('./socket');

io.on('connection', socketConnect);

// io.on('connection', (socket) => {
//   // eslint-disable-next-line no-console
//   console.log(`Socket.io => CONNECTION : ${socket.id}`); // XXX
//   // eslint-disable-next-line no-console
//   // console.log(socket);

//   // handle the event sent with socket.send()
//   socket.on('tail.init', (data) => {
//     // eslint-disable-next-line no-console
//     console.log('tail.init');
//     // eslint-disable-next-line no-console
//     console.log(data);
//   });
// });

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
// module.exports = (process.env.DEV ? app : httpsServer);
module.exports = httpsServer;
