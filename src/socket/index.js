// Get SSH config
const fs = require('fs');
const path = require('path');

const configSsh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ssh.json'), 'utf8')).config;
// Create SSH object
const SSH = require('simple-ssh');

const tails = [];

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
        // eslint-disable-next-line quotes
        // eslint-disable-next-line max-len
        // const filebeatConfig = "filebeat.inputs:\n- type: log\n  enabled: true\n  paths:\n    - /var/log/*.log\noutput.console:\n  enabled: true\n  pretty: false\nlogging.level: error\n";
        const filebeatConfig = `filebeat.inputs:\n- type: log\n  enabled: true\n  paths:\n    - ${payload.path}\noutput.console:\n  enabled: true\n  pretty: false\nlogging.level: error\n`;

        tails[payload.tailId]
          .exec(`if [ -d "/tmp/ez-${payload.tailId}" ]; then ps auxwww | grep \`cat /tmp/ez-${payload.tailId}/running.pid\` | grep -v "grep" -q && exit 42; fi;`, {
            exit(code) {
              if (code === 42) {
                // If Filebeat is still running for this Pipeline,
                // simply prevent from running it again.
                if (socket.connected) {
                  socket.emit('tail.log', { tailId: payload.tailId, code: 'ERROR', payload: 'Filebeat is still running for this Pipeline' });
                  socket.emit('tail.log', { tailId: payload.tailId, code: 'EXIT', payload: code });
                }
                return false;
              }
              return true;
            }
          })
          .exec(`rm -rf /tmp/ez-${payload.tailId}`, {})
          .exec(`mkdir /tmp/ez-${payload.tailId}`, {})
          .exec(`mkdir /tmp/ez-${payload.tailId}/lib`, {})
          .exec(`chmod 700 /tmp/ez-${payload.tailId}/lib`, {})
          .exec(`cat > /tmp/ez-${payload.tailId}/config.yml`, { in: filebeatConfig })
          .exec(`chmod 700 /tmp/ez-${payload.tailId}/config.yml`, {})
          // .exec(`tail -n 0 -F ${payload.path}`, {
          .exec(`/usr/share/filebeat/bin/filebeat -c config.yml --path.home /usr/share/filebeat --path.config /tmp/ez-${payload.tailId} --path.data /tmp/ez-${payload.tailId}/lib -e & echo -e $! > /tmp/ez-${payload.tailId}/running.pid`, {
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
          // .exec(`echo 123 > /tmp/ez-${payload.tailId}/running.pid`, {})
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
