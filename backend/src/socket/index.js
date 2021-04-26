// Get SSH config
const fs = require('fs');
const path = require('path');
const configSsh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ssh.json'), 'utf8')).config;
// Create SSH object
var SSH = require('simple-ssh');

let tails = [];

function socketConnect(socket) {
  // eslint-disable-next-line no-console
  console.log(`Socket.io => CONNECTION : ${socket.id} (auth: ${socket.token})`); // XXX

  if (socket.connected) {
    socket.emit('tail.log', { code: 'OK', log: 'some log' });
  }
  socket.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('Sokect.on(connect)');
  });

  // A new tail is requested
  socket.on('tail.init', (payload) => {
    // eslint-disable-next-line no-console
    console.log('tail.init');
    // eslint-disable-next-line no-console
    console.log(payload);

    if (
      payload
      && payload.path
      && payload.tailId
      && payload.path.length > 0
      && payload.tailId.length > 0
    ) {
      // Check the tailId doesn't already exist
      if (!tails[payload.tailId]) {
        tails[payload.tailId] = new SSH(configSsh);

        tails[payload.tailId]
          .exec(`tail -n 0 -F ${payload.path}`, {
            err(stderr) {
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'ERROR', payload: stderr });
              }
            },
            exit(code) {
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'EXIT', payload: code });
              }
            },
            out(stdout) {
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'STDOUT', payload: stdout });
              }
            }
          })
          .on('end', (err) => {
            if (socket.connected) {
              socket.emit('tail.log', { tailId: payload.tailId, code: 'END', payload: err });
            }
          })
          .start({
            failure() {
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'FAILURE' });
              }
            }
          });
      }
    }
  }); // On: tail.init

  // Killing an existing tail
  socket.on('tail.kill', (payload) => {
    // eslint-disable-next-line no-console
    console.log('tail.kill');
    // eslint-disable-next-line no-console
    console.log(payload);

    if (
      payload
      && payload.tailId
      && payload.tailId.length > 0
    ) {
      // Check the tailId exists
      if (tails[payload.tailId]) {
        tails[payload.tailId].end();
        tails[payload.tailId] = null;
      }
    }
  }); // On: tail.kill

  // Killing an existing tail
  socket.on('tail.showtaillist', () => {
    // eslint-disable-next-line no-console
    console.log('tail.showtaillist');

    // eslint-disable-next-line no-console
    console.log(tails);
  }); // On: tail.showtaillist
}

module.exports = socketConnect;
