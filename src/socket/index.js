const { isValidAuth } = require('./middleware');
const { tailInit, tailKill } = require('./controllers/tail');
const { installShipper } = require('./controllers/installShipper');

function socketConnect(socket) {
  // eslint-disable-next-line no-console
  console.log(`Socket.io => CONNECTION : ${socket.id} (Authenticated user: ${socket.handshake.auth.user})`); // XXX

  // if (socket.connected) {
  //   socket.emit('tail.log', { code: 'OK', log: 'some log' });
  // }
  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Sokect.on(connect)');
  });

  // -------------------------------
  // Tails

  // A new tail is requested
  socket.on('tail.init', (payload) => {
    tailInit(socket, payload);
  }); // On: tail.init

  // Killing an existing tail
  socket.on('tail.kill', (payload) => {
    tailKill(socket, payload);
  }); // On: tail.showtaillist

  // -------------------------------
  // Shiper installation

  // A new Shipper Install is requested
  socket.on('shipper.install', (payload) => {
    installShipper(socket, payload);
  }); // On: shipper.install
}

module.exports = {
  socketConnect,
  isValidAuth
};
