const { isValidAuth } = require('./middleware');
const { tailInit, tailKill } = require('./controllers/tail');
const { installShipper } = require('./controllers/installShipper');
const { statsInit, statsKill } = require('./controllers/containersStats');
const { containerLogsInit, containerLogsKill } = require('./controllers/containersLogs');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

function socketConnect(socket) {
  // eslint-disable-next-line no-console
  logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | CONNECTION - Connection requested.`);

  // if (socket.connected) {
  //   socket.emit('tail.log', { code: 'OK', log: 'some log' });
  // }
  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | connect - Connection established.`);
  });

  // -------------------------------
  // Tails

  // A new tail is requested
  socket.on('tail.init', (payload) => {
    // eslint-disable-next-line no-console
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | tail.init - New Log Source Tail has been requested.`);
    tailInit(socket, payload);
  }); // On: tail.init

  // Killing an existing tail
  socket.on('tail.kill', (payload) => {
    // eslint-disable-next-line no-console
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | tail.kill - Log Source Tail termination has been requested.`);
    tailKill(socket, payload);
  }); // On: tail.showtaillist

  // -------------------------------
  // Shiper installation

  // A new Shipper Install is requested
  socket.on('shipper.install', (payload) => {
    // eslint-disable-next-line no-console
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | shipper.install - Installation of a log Shipper has been requested`);
    installShipper(socket, payload);
  }); // On: shipper.install

  // -------------------------------
  // Container Stats Tails

  // A new Container Stats Tail is requested
  socket.on('statsTail.init', (payload) => {
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | statsTail.init - Container Stats Tail has been requested.`);
    statsInit(socket, payload);
  }); // On: statsTail.init

  // Killing an existing Container Stats Tail
  socket.on('statsTail.kill', (payload) => {
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | statsTail.kill - Container Stats Tail termination has been requested.`);
    statsKill(socket, payload);
  }); // On: statsTail.kill

  // -------------------------------
  // Container Logs Tails

  // A new Container Logs Tail is requested
  socket.on('containerLogsTail.init', (payload) => {
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | containerLogsTail.init - Container Logs Tail has been requested.`);
    containerLogsInit(socket, payload);
  }); // On: containerLogsTail.init

  // Killing an existing Container Logs Tail
  socket.on('containerLogsTail.kill', (payload) => {
    logToSystem('Information', `SOCKET | ${socket.id} | ${socket.handshake.auth.user} | containerLogsTail.kill - Container Logs Tail termination has been requested.`);
    containerLogsKill(socket, payload);
  }); // On: containerLogsTail.kill
}

module.exports = {
  socketConnect,
  isValidAuth
};
