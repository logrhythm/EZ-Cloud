const { isValidAuth } = require('./middleware');
const { tailInit, tailKill } = require('./controllers/tail');
const { installShipper } = require('./controllers/installShipper');

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
}

module.exports = {
  socketConnect,
  isValidAuth
};
