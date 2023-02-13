// Create SSH object
const SSH = require('simple-ssh');

// Import shared libraries
const { getSshConfigForCollector } = require('../../shared/collectorSshConfig');
const { logToSystem } = require('../../shared/systemLogging');

const statsTails = [];

async function statsInit(socket, payload) {
  if (
    payload
    && payload.openCollectorUid
    && payload.openCollectorUid.length > 0
  ) {
    const socketUid = (socket && socket.id ? socket.id : '');

    // Check the openCollectorUid doesn't already exist
    if (!statsTails[`${socketUid}_${payload.openCollectorUid}`]) {
      const configSsh = await getSshConfigForCollector({ uid: payload.openCollectorUid });

      if (
        configSsh
        && configSsh.host
        && configSsh.host.length
        && configSsh.port > 0
      ) {
        statsTails[`${socketUid}_${payload.openCollectorUid}`] = new SSH(configSsh);

        if (socket.connected) {
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STDERR', payload: '🚀 Container Stats Tail starting...' });
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STDERR', payload: '🎯 Attempting to connect to host...' });
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Container Stats Tail Started' });
        }

        statsTails[`${socketUid}_${payload.openCollectorUid}`]
          // Check we are connected
          .exec('pwd', {
            exit() {
              if (socket.connected) {
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STDERR', payload: '📑 Tailing the realtime data...' });
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Connected to host' });
              }
              return true;
            }
          })
          // .exec('docker stats -a --no-trunc --format "{{ json . }}/* OC_ADMIN-DockerStats */"', {
          .exec('docker stats --all --no-trunc --format "{{ json . }}{{/* OC_ADMIN-DockerStats */}}"', {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              if (socket.connected) {
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STDERR', payload: stderr });
              }
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (socket.connected) {
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: code });
              }
              // eslint-disable-next-line no-use-before-define
              setTimeout(tailKillShipper, 2500, socket, payload);
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              if (socket.connected) {
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Receiving Real Time Data' });
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STDOUT', payload: stdout });
              }
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            if (socket.connected) {
              socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Container Stats Tail Ended' });
              socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'END', payload: err });
              socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Stopped' });
            }
            // eslint-disable-next-line no-use-before-define
            setTimeout(tailKillShipper, 1000, socket, payload);
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              if (socket.connected) {
                socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'FAILURE' });
              }
            }
          });
      } else {
        if (socket.connected) {
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'ERROR', payload: '❌ Container Stats Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.' });
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: 1 });
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'END', payload: 'Container Stats Tail failed to start.' });
          socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Stopped' });
        }
        logToSystem('Warning', 'statsInit - Container Stats Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.');
      }
    } else {
      // The openCollectorUid does already exist
      if (socket.connected) {
        socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'ERROR', payload: '❌ Container Stats Tail failed to start due to another Container Stats Tail with the same openCollectorUid already exists.' });
        socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: 1 });
        socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'END', payload: 'Container Stats Tail failed to start.' });
        socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Stopped' });
      }
      logToSystem('Warning', 'statsInit - Container Stats Tail failed to start due to another Container Stats Tail with the same openCollectorUid already exists.');
    }
  } else {
    // Required Payload absent or incomplete
    if (socket.connected) {
      socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'ERROR', payload: '❌ Container Stats Tail failed to start due to incomplete Payload in request.' });
      socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: 1 });
      socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'END', payload: 'Container Stats Tail failed to start.' });
      socket.emit('statsTail.log', { openCollectorUid: payload.openCollectorUid, code: 'STAGE', payload: 'Stopped' });
    }
    logToSystem('Error', 'statsInit - Container Stats Tail failed to start due to incomplete Payload in request.');
  }
} // statsInit

function statsKill(socket, payload) {
  const socketUid = (socket && socket.id ? socket.id : '');
  // console.log('statsKill 💣');
  if (
    payload
    && payload.openCollectorUid
    && payload.openCollectorUid.length > 0
  ) {
    // Check the openCollectorUid exists
    if (statsTails[`${socketUid}_${payload.openCollectorUid}`]) {
      statsTails[`${socketUid}_${payload.openCollectorUid}`].end();
      statsTails[`${socketUid}_${payload.openCollectorUid}`] = null;
    }
  }
} // statsKill

async function tailKillShipper(socket, payload) {
  const socketUid = (socket && socket.id ? socket.id : '');
  // console.log('tailKillShipper 💣💣💣');
  try {
    if (
      payload
      && payload.openCollectorUid
      && payload.openCollectorUid.length > 0
    ) {
      // Check the openCollectorUid doesn't already exist
      if (!statsTails[`${socketUid}_${payload.openCollectorUid}`]) {
        const configSsh = await getSshConfigForCollector({ uid: payload.openCollectorUid });

        statsTails[`${socketUid}_${payload.openCollectorUid}`] = new SSH(configSsh);

        statsTails[`${socketUid}_${payload.openCollectorUid}`]
          .exec('ps xwww -o pid,args | grep "/\\* OC_ADMIN-DockerStats \\*/" | grep -v "grep" -q && exit 42;', {
            exit(code) {
              if (code === 42) {
                // If Docker Stats is still running for this OpenCollector,
                // go ahead and kill it.
                if (socket.connected) {
                  socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'STDOUT', payload: 'Docker Stats is still running for this OpenCollector. Going for the kill.' });
                }
                return true;
              }
              if (socket.connected) {
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'STDOUT', payload: 'Docker Stats does\'t seem to be running for this OpenCollector. Doing nothing.' });
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: code });
              }
              return false;
            }
          })
          .exec('kill $(ps xwww -o pid,args | grep "/\\* OC_ADMIN-DockerStats \\*/" | grep -v "grep" | grep -o "^[0-9]\\+") && echo -e "Docker Stats process terminated.";', {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              if (socket.connected) {
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'STDERR', payload: stderr });
              }
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                if (socket.connected) {
                  socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'ERROR', payload: 'Something didn\'t go according to plan while trying to terminate Docker Stats\' Process.' });
                }
                return false;
              }
              if (socket.connected) {
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'EXIT', payload: code });
              }
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              if (socket.connected) {
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'STDOUT', payload: stdout });
              }
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            if (socket.connected) {
              socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'END', payload: err });
            }
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              if (socket.connected) {
                socket.emit('statsTail.kill', { openCollectorUid: payload.openCollectorUid, code: 'FAILURE' });
              }
            }
          });
      }
    }
  } catch (err) {
    //
  }
} // tailKillShipper

module.exports = {
  statsInit,
  statsKill
};
