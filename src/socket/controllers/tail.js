// Create SSH object
const SSH = require('simple-ssh');

// Import shared libraries
const { collectionConfigToYml } = require('../../shared/collectionConfigToYml');
const { collectionConfigToJson } = require('../../shared/collectionConfigToJson');
const { getCollectorSshConfigForPipeline } = require('../../shared/collectorSshConfig');

const tails = [];

async function tailInit(socket, payload) {
  if (
    payload
    && payload.tailId
    && payload.tailId.length > 0
    && payload.pipelineUid
    && payload.pipelineUid.length > 0
    && payload.collectionConfig
    && payload.collectionConfig.collectionShipper
    && payload.collectionConfig.collectionShipper.length > 0
    && payload.collectionConfig.collectionMethod
    && payload.collectionConfig.collectionMethod.length > 0
  ) {
    // Check the tailId doesn't already exist
    if (!tails[payload.tailId]) {
      const configSsh = await getCollectorSshConfigForPipeline({ uid: payload.pipelineUid });

      tails[payload.tailId] = new SSH(configSsh);

      if (payload.collectionConfig.collectionShipper === 'filebeat') {
        const inputYml = collectionConfigToYml(payload.collectionConfig);

        const filebeatConfig = `filebeat.inputs:\n${inputYml}\n\noutput.console:\n  enabled: true\n  pretty: false\nlogging.level: error\n`;
        tails[payload.tailId]
          .exec(`if [ -d "/tmp/ez-${payload.tailId}" ]; then ps auxwww | grep \`cat /tmp/ez-${payload.tailId}/running.pid\` | grep -v "grep" -q && exit 42; fi;`, {
            exit(code) {
              if (code === 42) {
                // If Shipper is still running for this Pipeline,
                // simply prevent from running it again.
                if (socket.connected) {
                  socket.emit('tail.log', { tailId: payload.tailId, code: 'ERROR', payload: 'Shipper is still running for this Pipeline' });
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
                socket.emit('tail.log', { tailId: payload.tailId, code: 'STDERR', payload: stderr });
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
      } else if (payload.collectionConfig.collectionShipper === 'jsBeat') {
        const inputJson = collectionConfigToJson(payload.collectionConfig);

        // Parse the JSON into a Config object, so we can modify it a bit
        let jsBeatConfigJson = {};
        try {
          jsBeatConfigJson = JSON.parse(inputJson);
        } catch (err) {
          // Fail silently
        }

        // Force output to Console and nothing to Open Collector
        jsBeatConfigJson.printToConsole = true;
        jsBeatConfigJson.sendToOpenCollector = false;
        // Turn it on
        jsBeatConfigJson.active = true;

        // Put the Config object back into JSON
        let jsBeatConfig = '';
        try {
          jsBeatConfig = JSON.stringify(jsBeatConfigJson, null, '  ');
        } catch (err) {
          // Fail silently
        }
        tails[payload.tailId]
          .exec(`if [ -d "/tmp/ez-${payload.tailId}" ]; then ps auxwww | grep \`cat /tmp/ez-${payload.tailId}/running.pid\` | grep -v "grep" -q && exit 42; fi;`, {
            exit(code) {
              if (code === 42) {
                // If Shipper is still running for this Pipeline,
                // simply prevent from running it again.
                if (socket.connected) {
                  socket.emit('tail.log', { tailId: payload.tailId, code: 'ERROR', payload: 'Shipper is still running for this Pipeline' });
                  socket.emit('tail.log', { tailId: payload.tailId, code: 'EXIT', payload: code });
                }
                return false;
              }
              return true;
            }
          })
          .exec(`rm -rf /tmp/ez-${payload.tailId}`, {})
          .exec(`mkdir --parent /tmp/ez-${payload.tailId}/config/inputs.d`, {})
          .exec(`cat > /tmp/ez-${payload.tailId}/config/inputs.d/tail.json`, { in: jsBeatConfig })
          .exec(`/opt/jsBeat/bin/start.sh --jsBeatRoot "/tmp/ez-${payload.tailId}" --logFilePath "/tmp/ez-${payload.tailId}/log/jsBeat" --logLevel verbose & echo -e $! > /tmp/ez-${payload.tailId}/running.pid ; echo -e "Shipper started. Shipper's PID: $(cat /tmp/ez-${payload.tailId}/running.pid)" >&2 ; tail -F "/tmp/ez-${payload.tailId}/log/jsBeat" >&2`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'STDERR', payload: stderr });
              }
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (socket.connected) {
                socket.emit('tail.log', { tailId: payload.tailId, code: 'EXIT', payload: code });
              }
              setTimeout(tailKillShipper, 2500, socket, payload);
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
            setTimeout(tailKillShipper, 1000, socket, payload);
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

async function tailKillShipper(socket, payload) {
  // console.log('tailKillShipper 💣💣💣');
  try {
    if (
      payload
      && payload.tailId
      && payload.tailId.length > 0
      && payload.pipelineUid
      && payload.pipelineUid.length > 0
    ) {
      // Check the tailId doesn't already exist
      if (!tails[payload.tailId]) {
        const configSsh = await getCollectorSshConfigForPipeline({ uid: payload.pipelineUid });

        tails[payload.tailId] = new SSH(configSsh);

        tails[payload.tailId]
          .exec(`if [ -d "/tmp/ez-${payload.tailId}" ]; then ps auxwww | grep \`cat /tmp/ez-${payload.tailId}/running.pid\` | grep -v "grep" -q && exit 42; fi;`, {
            exit(code) {
              if (code === 42) {
                // If Shipper is still running for this Pipeline,
                // go ahead and kill it.
                if (socket.connected) {
                  socket.emit('tail.kill', { tailId: payload.tailId, code: 'STDOUT', payload: 'Shipper is still running for this Pipeline. As expected. GNow ging for the kill.' });
                }
                return true;
              }
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'ERROR', payload: 'Shipper does\'t seem to be running for this Pipeline. Doing nothing.' });
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'EXIT', payload: code });
              }
              return false;
            }
          })
          .exec(`if [ -e "/tmp/ez-${payload.tailId}/running.pid" ]; then kill $(cat /tmp/ez-${payload.tailId}/running.pid) && echo -e "Pipeline process terminated."; else echo -e "PID file is missing: /tmp/ez-${payload.tailId}/running.pid" 1>&2 ; exit 42; fi;`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'STDERR', payload: stderr });
              }
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                if (socket.connected) {
                  socket.emit('tail.kill', { tailId: payload.tailId, code: 'ERROR', payload: 'Something didn\'t go according to plan while trying to terminate Shipper\' Process.' });
                }
                return false;
              }
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'EXIT', payload: code });
              }
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'STDOUT', payload: stdout });
              }
            }
          })
          .exec(`rm -rf /tmp/ez-${payload.tailId}`, {
            err(stderr) {
              // console.log('STDERR:::' + stderr);
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'STDERR', payload: stderr });
              }
            },
            exit(code) {
              // console.log('CODE:::' + code);
              if (code !== 0) {
                if (socket.connected) {
                  socket.emit('tail.kill', { tailId: payload.tailId, code: 'ERROR', payload: 'Something didn\'t go according to plan while trying to clean the temporary Shipper\' directory.' });
                }
                return false;
              }
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'EXIT', payload: code });
              }
              return true;
            },
            out(stdout) {
              // console.log('STDOUT:::' + stdout);
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'STDOUT', payload: stdout });
              }
            }
          })
          .on('end', (err) => {
            // console.log('END:::' + err);
            if (socket.connected) {
              socket.emit('tail.kill', { tailId: payload.tailId, code: 'END', payload: err });
            }
          })
          .start({
            failure() {
              // console.log('FAILURE:::' + err);
              if (socket.connected) {
                socket.emit('tail.kill', { tailId: payload.tailId, code: 'FAILURE' });
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
  tailInit,
  tailKill
};
