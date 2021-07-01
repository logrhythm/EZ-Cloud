const { isValidAuth } = require('./middleware');
const { tailInit, tailKill } = require('./controllers/tail');
const { installShipper } = require('./controllers/installShipper');

function socketConnect(socket) {
  // eslint-disable-next-line no-console
  // console.log(`Socket.io => CONNECTION : ${socket.id} (Authenticated user: ${socket.handshake.auth.user})`); // XXX
  console.log('SOCKET', `/CONNECTION/_id/${socket.id}`, 200, '-', socket.handshake.auth.user, '-');

  // if (socket.connected) {
  //   socket.emit('tail.log', { code: 'OK', log: 'some log' });
  // }
  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('SOCKET', `/connect/_id/${socket.id}`, 200, '-', socket.handshake.auth.user, '-');
  });

  // -------------------------------
  // Tails

  // A new tail is requested
  socket.on('tail.init', (payload) => {
    // eslint-disable-next-line no-console
    console.log('SOCKET', `/tail.init/_id/${socket.id}`, 200, '-', socket.handshake.auth.user, '-');
    tailInit(socket, payload);
  }); // On: tail.init

  // Killing an existing tail
  socket.on('tail.kill', (payload) => {
    // eslint-disable-next-line no-console
    console.log('SOCKET', `/tail.kill/_id/${socket.id}`, 200, '-', socket.handshake.auth.user, '-');
    tailKill(socket, payload);
  }); // On: tail.showtaillist

  // -------------------------------
  // Shiper installation

  // A new Shipper Install is requested
  socket.on('shipper.install', (payload) => {
    // eslint-disable-next-line no-console
    console.log('SOCKET', `/shipper.install/_id/${socket.id}`, 200, '-', socket.handshake.auth.user, '-');
    installShipper(socket, payload);
  }); // On: shipper.install
}

module.exports = {
  socketConnect,
  isValidAuth
};
