// Create SSH object
const SSH = require('simple-ssh');

// Lib to get the SSH config for a given OpenCollector
// const { getSshConfigForCollector } = require('../../api/config');
const { getSshConfigForCollector } = require('../../shared/collectorSshConfig');

const installs = [];

function getInstallerUrls(socket, payload) {
  if (
    socket && payload
  ) {
    // Get from GitHub
    // Emit back the list
  }
}
function installShipper(socket, payload) {
  // Steps:
  // 1. Download Shipper
  // 2. Check checksum
  // 3. Install Shipper

  if (
    payload
    && payload.jobId // UID of the JOb
    && payload.jobId.length > 0
  ) {
    try {
      if (
        payload.uid // UID of the Collector
        && payload.uid.length > 0
        && payload.installerSource // Source information as to where to downlad the Shipper from
        && payload.installerSource.url
        && payload.installerSource.url.length > 0
        && payload.installerSource.filename
        && payload.installerSource.filename.length > 0
        && payload.installerSource.installer
        && payload.installerSource.installer.length > 0
        && payload.installerSource.sha
        && payload.installerSource.sha.url
        && payload.installerSource.sha.url.length > 0
        && payload.installerSource.sha.filename
        && payload.installerSource.sha.filename.length > 0
        && payload.installerSource.sha.hash
        && payload.installerSource.sha.hash.length > 0
      ) {
        // Sanitise the UID as we use it to touch the file system
        // eslint-disable-next-line no-param-reassign
        payload.jobId = payload.jobId.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Check the jobId doesn't already exist
        if (!installs[payload.jobId]) {
          getSshConfigForCollector({ uid: payload.uid }).then((sshConfig) => {
            installs[payload.jobId] = new SSH(JSON.parse(JSON.stringify(sshConfig)));

            // New main Filebeat configuration
            // eslint-disable-next-line no-template-curly-in-string
            const filebeatConfig = 'filebeat.config.inputs:\n  enabled: true\n  path: ${path.config}/inputs.d/*.yml\n  reload.enabled: true\n  reload.period: 10s\noutput.logstash:\n  hosts: ["localhost:5044"]\nprocessors:\n  - add_host_metadata:\n      when.not.contains.tags: forwarded\n  - add_cloud_metadata: ~\n  - add_docker_metadata: ~\n  - add_kubernetes_metadata: ~\n\n';

            // Build the list of steps
            const steps = [
              {
                action: 'Clean up directories left by any previous attemp',
                command: `if [ -d "/tmp/ez-shipper-install-${payload.jobId}" ]; then rm -rf /tmp/ez-shipper-install-${payload.jobId}; fi;`
              },
              {
                action: 'Create fresh temporary folder to download installer into',
                command: `mkdir /tmp/ez-shipper-install-${payload.jobId}`
              },
              {
                action: 'Download package to install // ' + `curl -o /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.filename} -L ${payload.installerSource.url}`,
                command: `curl -o /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.filename} -L ${payload.installerSource.url}`
              },
              {
                action: 'Use the package manager to install the package',
                command: (
                  // eslint-disable-next-line no-nested-ternary
                  payload.installerSource.installer === 'DEB'
                    ? `sudo dpkg -i /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.filename}`
                    : (
                      payload.installerSource.installer === 'RPM'
                        ? `sudo rpm -vi /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.filename}`
                        : `echo -e "Unknown Package Manager (${payload.installerSource.installer}). Exiting."; exit 42;`
                    )
                )
              },
              {
                action: 'Create new Input folder to drop dynamic input files into',
                command: 'sudo mkdir -p /etc/filebeat/inputs.d'
              },
              {
                action: 'Backup default configuration file',
                command: 'sudo -- sh -c \'[ -f "/etc/filebeat/filebeat.yml" ] && mv -f /etc/filebeat/filebeat.yml /etc/filebeat/filebeat.original.yml\'',
                continueOnFailure: true
              },
              {
                action: 'Create configuration file',
                command: `cat > /tmp/ez-shipper-install-${payload.jobId}/filebeat.yml`,
                stdin: filebeatConfig
              },
              {
                action: 'Move configuration file into place',
                command: `sudo cp -f /tmp/ez-shipper-install-${payload.jobId}/filebeat.yml /etc/filebeat/filebeat.yml`
              },
              {
                action: 'Set configuration file the correct access rights',
                command: 'sudo chmod 700 /etc/filebeat/filebeat.yml'
              },
              {
                action: 'List the files of the temporary directory',
                command: `ls -la /tmp/ez-shipper-install-${payload.jobId}/`
              },
              {
                action: 'List the files of the Shipper configuration directory',
                command: 'ls -la /etc/filebeat/'
              },
              {
                action: 'Dump Shipper\'s configuration file',
                command: 'sudo cat /etc/filebeat/filebeat.yml'
              },
              {
                action: 'Start Shipper service',
                command: 'sudo service filebeat start',
                continueOnFailure: true
              },
              {
                action: 'Clean up. Remove the temporary directory and its content',
                command: `rm -rf /tmp/ez-shipper-install-${payload.jobId}/`
              // },
              // {
              //   action: 'Try to add some more text to the file in the temporary directory. This will fail.',
              //   command: `echo "Tony" > /tmp/ez-shipper-install-${payload.jobId}/test.txt`
              // },
              // {
              //   action: '',
              //   command: ``
              }
            ];

            // DEB:
            // curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.13.0-amd64.deb
            // sudo dpkg -i filebeat-7.13.0-amd64.deb

            // RPM
            // curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.13.0-x86_64.rpm
            // sudo rpm -vi filebeat-7.13.0-x86_64.rpm

            // .exec(`if [ -d "/tmp/ez-${payload.tailId}" ]; then ps auxwww | grep \`cat /tmp/ez-${payload.tailId}/running.pid\` | grep -v "grep" -q && exit 42; fi;`, {

            // installs[payload.jobId]
            //   .exec(`mkdir /tmp/ez-shipper-install-${payload.jobId}`, {))
            //   .exec(`rm -rf /tmp/ez-${payload.jobId}`, {})
            //   .exec(`mkdir /tmp/ez-${payload.jobId}`, {})
            //   .exec(`mkdir /tmp/ez-${payload.jobId}/lib`, {})
            //   .exec(`chmod 700 /tmp/ez-${payload.jobId}/lib`, {})
            //   .exec(`cat > /tmp/ez-${payload.jobId}/config.yml`, { in: filebeatConfig })
            //   .exec(`chmod 700 /tmp/ez-${payload.jobId}/config.yml`, {})
            // eslint-disable-next-line max-len
            //   .exec(`/usr/share/filebeat/bin/filebeat -c config.yml --path.home /usr/share/filebeat --path.config /tmp/ez-${payload.jobId} --path.data /tmp/ez-${payload.jobId}/lib -e & echo -e $! > /tmp/ez-${payload.jobId}/running.pid`, {

            // Add the Steps to the Exec stack
            steps.forEach((step, stepCounter) => {
              // eslint-disable-next-line no-console
              console.log(`installShipper - Adding step: (${stepCounter}) ${step.action}...`);
              installs[payload.jobId]
                .exec(step.command, {
                  in: step.stdin || '',
                  exit(code) {
                    let continueToNextStep = true;

                    if (code !== 0) {
                      if (socket.connected) {
                        socket.emit('shipper.install',
                          {
                            jobId: payload.jobId,
                            code: 'ERROR',
                            payload: 'STEP FAILED',
                            step: stepCounter + 1,
                            totalSteps: steps.length
                          });
                        socket.emit('shipper.install',
                          {
                            jobId: payload.jobId,
                            code: 'EXIT',
                            payload: `Return code: ${code}`,
                            step: stepCounter + 1,
                            totalSteps: steps.length
                          });
                      }

                      continueToNextStep = false;
                    } // if (code !== 0) {

                    if (socket.connected) {
                      socket.emit('shipper.install',
                        {
                          jobId: payload.jobId,
                          code: 'FINISHED',
                          payload: step.action,
                          step: stepCounter + 1,
                          totalSteps: steps.length
                        });
                    }

                    // Check if need to force Continue
                    if (step.continueOnFailure === true) {
                      continueToNextStep = true;
                    }

                    return continueToNextStep;
                  },
                  err(stderr) {
                    if (socket.connected) {
                      socket.emit('shipper.install',
                        {
                          jobId: payload.jobId,
                          code: 'STDERR',
                          payload: stderr,
                          step: stepCounter + 1,
                          totalSteps: steps.length
                        });
                    }
                  },
                  out(stdout) {
                    if (socket.connected) {
                      socket.emit('shipper.install',
                        {
                          jobId: payload.jobId,
                          code: 'STDOUT',
                          payload: stdout,
                          step: stepCounter + 1,
                          totalSteps: steps.length
                        });
                    }
                  }
                });
            });

            // Add Event handlers and start
            installs[payload.jobId]
              .on('end', (err) => {
                // Cleanup the sessions
                // eslint-disable-next-line no-use-before-define
                killInstallShipper(socket, payload);
                if (socket.connected) {
                  socket.emit('shipper.install',
                    {
                      jobId: payload.jobId,
                      code: 'END',
                      payload: err || 'SUCCESS',
                      step: null,
                      totalSteps: steps.length
                    });
                }
              })
              .start({
                failure() {
                  // Cleanup the sessions
                  // eslint-disable-next-line no-use-before-define
                  killInstallShipper(socket, payload);
                  if (socket.connected) {
                    socket.emit('shipper.install',
                      {
                        jobId: payload.jobId,
                        code: 'FAILURE',
                        payload: 'Job could not start',
                        step: null,
                        totalSteps: steps.length
                      });
                  }
                }
              });
          });
        } else if (socket.connected) {
          socket.emit('shipper.install',
            {
              jobId: payload.jobId,
              code: 'FAILURE',
              payload: 'A same job is still running with the same ID.',
              step: null,
              totalSteps: null
            });
        }
      } else if (socket.connected) {
        socket.emit('shipper.install',
          {
            jobId: payload.jobId,
            code: 'FAILURE',
            payload: 'Job could not start due to missing parameters',
            step: null,
            totalSteps: null
          });
      }
    } catch (error) {
      socket.emit('shipper.install',
        {
          jobId: payload.jobId,
          code: 'FAILURE',
          payload: `Job failed. Reason: ${error.message}`,
          step: null,
          totalSteps: null
        });
    } finally {
      // eslint-disable-next-line no-use-before-define
      killInstallShipper(socket, payload);
    }// Try / Catch / Finally
  } // if (payload)
} // installShipper

function uninstallShipper(socket, payload) {
  if (socket && payload) {
    //
  }
}

function killInstallShipper(socket, payload) {
  if (
    payload
    && payload.jobId
    && payload.jobId.length > 0
  ) {
    // Check the jobId exists
    if (installs[payload.jobId]) {
      try {
        installs[payload.jobId].end();
      } catch (error) {
        //
      } finally {
        installs[payload.jobId] = null;
      }
    }
  }
} // killInstallShipper

function killUninstallShipper(socket, payload) {
  killInstallShipper(socket, payload);
} // killUninstallShipper

module.exports = {
  getInstallerUrls,
  installShipper,
  uninstallShipper,
  killInstallShipper,
  killUninstallShipper
};
