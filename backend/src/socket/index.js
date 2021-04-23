// Get SSH config
const fs = require('fs');
const path = require('path');
const configSsh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ssh.json'), 'utf8')).config;
// Create SSH object
var SSH = require('simple-ssh');

function socketConnect(socket) {
  // eslint-disable-next-line no-console
  console.log(`Socket.io => CONNECTION : ${socket.id}`); // XXX

  if (socket.connected) {
    socket.emit('tail.log.abc', { code: 'OK', log: 'some log' });
  }

  // handle the event sent with socket.send()
  socket.on('tail.init', (pathToTail) => {
    // eslint-disable-next-line no-console
    console.log('tail.init');
    // eslint-disable-next-line no-console
    console.log(pathToTail);

    var ssh = new SSH(configSsh);

    /* eslint-disable max-len */

    // .exec('uname -r | awk -F. -v OFS= \'{print "{\\"version\\":{\\"detailed\\":{\\"major\\":\\""$1,"\\", \\"minor\\":\\""$2,"\\", \\"build\\":\\""$3,"\\"}, \\"full\\":\\""$1,"."$2,"."$3,"."$4,"."$5,"\\"}}"}\'', {
    // .exec(`tail -n 1 ${  pathToTail}`, {

    /* eslint-enable max-len */
    ssh
      .exec(`tail -f ${pathToTail}`, {
        err: function(stderr) {
          if (socket.connected) {
            socket.emit('tail.log.abc', { code: 'ERROR', payload: stderr });
          }
        },
        exit: function(code) {
          if (socket.connected) {
            socket.emit('tail.log.abc', { code: 'EXIT', payload: code });
          }
        },
        out: function(stdout) {
          if (socket.connected) {
            socket.emit('tail.log.abc', { code: 'STDOUT', payload: stdout });
          }
        }
      })
      .on('end', function(err) {
        if (socket.connected) {
          socket.emit('tail.log.abc', { code: 'END', payload: err });
        }
    })
      .start({
        failure: function () {
          if (socket.connected) {
            socket.emit('tail.log.abc', { code: 'FAILURE' });
          }
        }
      });
  });
}

module.exports = socketConnect;
