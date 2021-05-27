// Get SSH config
const fs = require('fs');
const path = require('path');

const configSsh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ssh.json'), 'utf8')).config;
// Create SSH object
const SSH = require('simple-ssh');

// Import shared collectionConfigToYml library
const { collectionConfigToYml } = require('../shared/collectionConfigToYml');

const tails = [];

function tailInit (socket, payload) {
  if (
    payload
    && payload.tailId
    && payload.collectionConfig
    && payload.collectionConfig.collectionMethod
    && payload.collectionConfig.collectionMethod.length > 0
    && payload.tailId.length > 0
  ) {
    // Check the tailId doesn't already exist
    if (!tails[payload.tailId]) {
      tails[payload.tailId] = new SSH(configSsh);
      const inputYml = collectionConfigToYml(payload.collectionConfig);

      const filebeatConfig = `filebeat.inputs:\n${inputYml}\n\noutput.console:\n  enabled: true\n  pretty: false\nlogging.level: error\n`;
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
        .exec(`/usr/share/filebeat/bin/filebeat -c config.yml --path.home /usr/share/filebeat --path.config /tmp/ez-${payload.tailId} --path.data /tmp/ez-${payload.tailId}/lib -e & echo -e $! > /tmp/ez-${payload.tailId}/running.pid`, {
          err(stderr) {
            // console.log('STDERR:::' + stderr);
            if (socket.connected) {
              socket.emit('tail.log', { tailId: payload.tailId, code: 'ERROR', payload: stderr });
            }
          },
          exit(code) {
            // console.log('CODE:::' + code);
            if (socket.connected) {
              socket.emit('tail.log', { tailId: payload.tailId, code: 'EXIT', payload: code });
            }
          },
          out(stdout) {
            // console.log('STDOUT:::' + stdout);
            if (socket.connected) {
              socket.emit('tail.log', { tailId: payload.tailId, code: 'STDOUT', payload: stdout });
            }
          }
        })
        .on('end', (err) => {
          // console.log('END:::' + err);
          if (socket.connected) {
            socket.emit('tail.log', { tailId: payload.tailId, code: 'END', payload: err });
          }
        })
        .start({
          failure() {
            // console.log('FAILURE:::' + err);
            if (socket.connected) {
              socket.emit('tail.log', { tailId: payload.tailId, code: 'FAILURE' });
            }
          }
        });
    }
  }
} // tailInit

function tailKill(socket, payload) {
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
} // tailKill

module.exports = {
  tailInit,
  tailKill
};
