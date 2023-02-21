/* eslint-disable object-curly-newline */
// Create SSH object
const SSH = require('simple-ssh');

// Import shared libraries
const { getSshConfigForCollector } = require('../../shared/collectorSshConfig');
const { logToSystem } = require('../../shared/systemLogging');

const containerLogsTails = [];

function socketEmit(socket, payload = {}) {
  if (socket && socket.connected) {
    socket.emit(payload.stream || 'containerLogsTail.log', {
      openCollectorUid: payload.openCollectorUid || '',
      containerId: payload.containerId || '',
      code: payload.code || '',
      payload: payload.payload || ''
    });
  }
}

async function containerLogsInit(socket, payload) {
  if (
    payload
    && payload.openCollectorUid
    && payload.openCollectorUid.length > 0
    && payload.containerId
    && payload.containerId.length > 0
  ) {
    const socketUid = (socket && socket.id ? socket.id : '');

    // Check the openCollectorUid doesn't already exist
    if (!containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]) {
      const configSsh = await getSshConfigForCollector({ uid: payload.openCollectorUid });

      if (
        configSsh
        && configSsh.host
        && configSsh.host.length
        && configSsh.port > 0
      ) {
        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = new SSH(configSsh);

        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STDERR', payload: '🚀 OC ADMIN | Container Logs Tail starting...' });
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STDERR', payload: '🎯 OC ADMIN | Attempting to connect to host...' });
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Container Stats Tail Started' });

        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]
          // Check we are connected
          .exec('pwd', {
            exit() {
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STDERR', payload: '📑 OC ADMIN | Tailing the realtime data...' });
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Connected to host' });
              return true;
            }
          })
          .exec(`docker logs --follow "${payload.containerId}"`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STDERR', payload: stderr });
            },
            exit(code) {
              // console.log('CODE:::' + code);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'EXIT', payload: code });
              // eslint-disable-next-line no-use-before-define
              setTimeout(containerLogsKillTail, 2500, socket, payload);
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Receiving Real Time Data' });
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STDOUT', payload: stdout });
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Container Stats Tail Ended' });
            socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'END', payload: err });
            socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Stopped' });
            // eslint-disable-next-line no-use-before-define
            setTimeout(containerLogsKillTail, 1000, socket, payload);
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'FAILURE' });

              // Remove the tail entry
              // eslint-disable-next-line no-use-before-define
              setTimeout(containerLogsKill, 500, socket, payload);
            }
          });
      } else {
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'ERROR', payload: '❌ Container Logs Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.' });
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'EXIT', payload: 1 });
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'END', payload: 'Container Logs Tail failed to start.' });
        socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Stopped' });
        logToSystem('Warning', 'containerLogsInit - Container Logs Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.');
      }
    } else {
      // The openCollectorUid does already exist
      socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'ERROR', payload: '❌ Container Logs Tail failed to start due to another Container Logs Tail with the same openCollectorUid already exists.' });
      socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'EXIT', payload: 1 });
      socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'END', payload: 'Container Logs Tail failed to start.' });
      socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Stopped' });
      logToSystem('Warning', 'containerLogsInit - Container Logs Tail failed to start due to another Container Logs Tail with the same openCollectorUid already exists.');
    }
  } else {
    // Required Payload absent or incomplete
    socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'ERROR', payload: '❌ Container Logs Tail failed to start due to incomplete Payload in request.' });
    socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'EXIT', payload: 1 });
    socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'END', payload: 'Container Logs Tail failed to start.' });
    socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.log', code: 'STAGE', payload: 'Stopped' });
    logToSystem('Error', 'containerLogsInit - Container Logs Tail failed to start due to incomplete Payload in request.');
  }
} // containerLogsInit

function containerLogsKill(socket, payload) {
  const socketUid = (socket && socket.id ? socket.id : '');
  // console.log('containerLogsKill 💣');
  if (
    payload
    && payload.openCollectorUid
    && payload.openCollectorUid.length > 0
  ) {
    // Check the openCollectorUid exists
    if (containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]) {
      try {
        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`].end();
      } finally {
        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = null;
      }
    }
  }
} // containerLogsKill

async function containerLogsKillTail(socket, payload) {
  const socketUid = (socket && socket.id ? socket.id : '');
  // console.log('containerLogsKillTail 💣💣💣');
  try {
    if (
      payload
      && payload.openCollectorUid
      && payload.openCollectorUid.length > 0
      && payload.containerId
      && payload.containerId.length > 0
    ) {
      // Check the openCollectorUid doesn't already exist
      if (!containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]) {
        const configSsh = await getSshConfigForCollector({ uid: payload.openCollectorUid });

        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = new SSH(configSsh);

        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]
          .exec(`ps xwww -o pid,args | grep -v "grep" | grep "docker logs --follow" | grep "${payload.containerId}" -q && exit 42;`, {
            exit(code) {
              if (code === 42) {
                // If Docker Stats is still running for this OpenCollector,
                // go ahead and kill it.
                socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'STDOUT', payload: 'Docker Logs is still running for this OpenCollector. As expected. Now going for the kill.' });
                return true;
              }
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'ERROR', payload: 'Docker Logs does\'t seem to be running for this OpenCollector. Doing nothing.' });
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'EXIT', payload: code });
              return false;
            }
          })
          .exec(`ps xwww -o pid,args | grep -v "grep" | grep "docker logs --follow" | grep "${payload.containerId}" | grep -o "^\\s*[0-9]\\+"`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'STDERR', payload: stderr });
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'ERROR', payload: 'Failed to grab Docker Logs\' Process ID.' });
                return false;
              }
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'EXIT', payload: code });
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'STDOUT', payload: `Docker Logs' Process ID(s): ${stdout}` });
            }
          })
          .exec(`kill $(ps xwww -o pid,args | grep -v "grep" | grep "docker logs --follow" | grep "${payload.containerId}" | grep -o "^\\s*[0-9]\\+") && echo -e "Docker Logs process terminated.";`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'STDERR', payload: stderr });
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'ERROR', payload: 'Something didn\'t go according to plan while trying to terminate Docker Logs\' Process.' });
                return false;
              }
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'EXIT', payload: code });
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'STDOUT', payload: stdout });
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'END', payload: err });
            // Remove the tail entry
            containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = null;
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              socketEmit(socket, { containerId: payload.containerId, openCollectorUid: payload.openCollectorUid, stream: 'containerLogsTail.kill', code: 'FAILURE' });
              // Remove the tail entry
              containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = null;
            }
          });
      }
    } else {
      // Required Payload absent or incomplete
      logToSystem('Error', 'containerLogsKillTail - Container Logs Tail could not be killed dues to incomplete Payload in request.');
    }
  } catch (err) {
    //
  }
} // containerLogsKillTail

module.exports = {
  containerLogsInit,
  containerLogsKill
};
