// Create SSH object
const SSH = require('simple-ssh');

// Import shared libraries
const { getSshConfigForCollector } = require('../../shared/collectorSshConfig');
const { logToSystem } = require('../../shared/systemLogging');

const containerLogsTails = [];

function socketEmit(socket, stream = 'containerLogsTail.log', code = '', payload) {
  if (socket.connected) {
    socket.emit(stream, {
      openCollectorUid: payload.openCollectorUid,
      containerId: payload.containerId,
      code,
      payload
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

        socketEmit(socket, 'containerLogsTail.log', 'STDERR', '🚀 Container Stats Tail starting...');
        socketEmit(socket, 'containerLogsTail.log', 'STDERR', '🎯 Attempting to connect to host...');
        socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Container Stats Tail Started');

        containerLogsTails[`${socketUid}_${payload.openCollectorUid}`]
          // Check we are connected
          .exec('pwd', {
            exit() {
              socketEmit(socket, 'containerLogsTail.log', 'STDERR', '📑 Tailing the realtime data...');
              socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Connected to host');
              return true;
            }
          })
          .exec(`docker logs --follow "${payload.containerId}"`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              socketEmit(socket, 'containerLogsTail.log', 'STDERR', stderr);
            },
            exit(code) {
              // console.log('CODE:::' + code);
              socketEmit(socket, 'containerLogsTail.log', 'EXIT', code);
              // eslint-disable-next-line no-use-before-define
              setTimeout(containerLogsKillTail, 2500, socket, payload);
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Receiving Real Time Data');
              socketEmit(socket, 'containerLogsTail.log', 'STDOUT', stdout);
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Container Stats Tail Ended');
            socketEmit(socket, 'containerLogsTail.log', 'END', err);
            socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Stopped');
            // eslint-disable-next-line no-use-before-define
            setTimeout(containerLogsKillTail, 1000, socket, payload);
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              socketEmit(socket, 'containerLogsTail.log', 'FAILURE');
            }
          });
      } else {
        socketEmit(socket, 'containerLogsTail.log', 'ERROR', '❌ Container Stats Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.');
        socketEmit(socket, 'containerLogsTail.log', 'EXIT', 1);
        socketEmit(socket, 'containerLogsTail.log', 'END', 'Container Stats Tail failed to start.');
        socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Stopped');
        logToSystem('Warning', 'containerLogsInit - Container Stats Tail failed to start due to missing OpenCollector host and/or port information for the SSH connection.');
      }
    } else {
      // The openCollectorUid does already exist
      socketEmit(socket, 'containerLogsTail.log', 'ERROR', '❌ Container Stats Tail failed to start due to another Container Stats Tail with the same openCollectorUid already exists.');
      socketEmit(socket, 'containerLogsTail.log', 'EXIT', 1);
      socketEmit(socket, 'containerLogsTail.log', 'END', 'Container Stats Tail failed to start.');
      socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Stopped');
      logToSystem('Warning', 'containerLogsInit - Container Stats Tail failed to start due to another Container Stats Tail with the same openCollectorUid already exists.');
    }
  } else {
    // Required Payload absent or incomplete
    socketEmit(socket, 'containerLogsTail.log', 'ERROR', '❌ Container Stats Tail failed to start due to incomplete Payload in request.');
    socketEmit(socket, 'containerLogsTail.log', 'EXIT', 1);
    socketEmit(socket, 'containerLogsTail.log', 'END', 'Container Stats Tail failed to start.');
    socketEmit(socket, 'containerLogsTail.log', 'STAGE', 'Stopped');
    logToSystem('Error', 'containerLogsInit - Container Stats Tail failed to start due to incomplete Payload in request.');
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
      containerLogsTails[`${socketUid}_${payload.openCollectorUid}`].end();
      containerLogsTails[`${socketUid}_${payload.openCollectorUid}`] = null;
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
          .exec(`ps auxwww | grep -v "grep" | grep "docker logs --follow" | grep "${payload.containerId}" -q && exit 42;`, {
            exit(code) {
              if (code === 42) {
                // If Docker Stats is still running for this OpenCollector,
                // go ahead and kill it.
                socketEmit(socket, 'containerLogsTail.kill', 'STDOUT', 'Docker Logs is still running for this OpenCollector. As expected. Now going for the kill.');
                return true;
              }
              socketEmit(socket, 'containerLogsTail.kill', 'ERROR', 'Docker Logs does\'t seem to be running for this OpenCollector. Doing nothing.');
              socketEmit(socket, 'containerLogsTail.kill', 'EXIT', code);
              return false;
            }
          })
          .exec(`kill $(ps auxwwww | grep -v "grep" | grep "docker logs --follow" | grep "${payload.containerId}" | grep -o "^\\s*\\d\\+") && echo -e "Docker Logs process terminated.";`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              socketEmit(socket, 'containerLogsTail.kill', 'STDERR', stderr);
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                socketEmit(socket, 'containerLogsTail.kill', 'ERROR', 'Something didn\'t go according to plan while trying to terminate Docker Logs\' Process.');
                return false;
              }
              socketEmit(socket, 'containerLogsTail.kill', 'EXIT', code);
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              socketEmit(socket, 'containerLogsTail.kill', 'STDOUT', stdout);
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            socketEmit(socket, 'containerLogsTail.kill', 'END', err);
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              socketEmit(socket, 'containerLogsTail.kill', 'FAILURE');
            }
          });
      }
    }
  } catch (err) {
    //
  }
} // containerLogsKillTail

module.exports = {
  containerLogsInit,
  containerLogsKill
};
