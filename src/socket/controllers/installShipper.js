// Create SSH object
const SSH = require('simple-ssh');

// Lib to get the SSH config for a given OpenCollector
// const { getSshConfigForCollector } = require('../../api/config');
const { getSshConfigForCollector } = require('../../shared/collectorSshConfig');

// Load the System Logging functions
const { logToSystem } = require('../../shared/systemLogging');

const installs = [];
const installStepsStatus = [];

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
        && (
          (
            payload.installerSource.url
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
          )
          || (
            payload.installerSource.jsBeat
            && payload.installerSource.jsBeat.url
            && payload.installerSource.jsBeat.url.length > 0
            && payload.installerSource.jsBeat.folderName
            && payload.installerSource.jsBeat.folderName.length > 0
            && payload.installerSource.jsBeat.sha256
            && payload.installerSource.jsBeat.sha256.length > 0
          )
        )
      ) {
        // Sanitise the UID as we use it to touch the file system
        // eslint-disable-next-line no-param-reassign
        payload.jobId = payload.jobId.replace(/[^a-zA-Z0-9_-]/g, '_');

        // Check the jobId doesn't already exist
        if (!installs[payload.jobId]) {
          getSshConfigForCollector({ uid: payload.uid }).then((sshConfig) => {
            // Prep the Steps status
            if (!installStepsStatus[payload.jobId]) {
              installStepsStatus[payload.jobId] = {
                steps: []
              };
            }

            logToSystem('Debug', `installShipper - Creating SSH connection [${payload.jobId}]...`);
            installs[payload.jobId] = new SSH(JSON.parse(JSON.stringify(sshConfig)));
            logToSystem('Debug', `installShipper - SSH session [${payload.jobId}] created.`);

            const steps = [];

            if (payload.installerSource.url) {
              // New main Filebeat configuration
              // eslint-disable-next-line no-template-curly-in-string
              const filebeatConfig = 'filebeat.config.inputs:\n  enabled: true\n  path: ${path.config}/inputs.d/*.yml\n  reload.enabled: true\n  reload.period: 10s\noutput.logstash:\n  hosts: ["localhost:5044"]\nprocessors:\n  - add_host_metadata:\n      when.not.contains.tags: forwarded\n  - add_cloud_metadata: ~\n  - add_docker_metadata: ~\n  - add_kubernetes_metadata: ~\n\n';

              // Build the list of steps
              steps.push(
                {
                  action: 'Clean up directories left by any previous attemp',
                  command: `if [ -d "/tmp/ez-shipper-install-${payload.jobId}" ]; then rm -rf /tmp/ez-shipper-install-${payload.jobId}; fi;`
                },
                {
                  action: 'Create fresh temporary folder to download installer into',
                  command: `mkdir /tmp/ez-shipper-install-${payload.jobId}`
                },
                {
                  action: `Download package to install // curl -o /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.filename} -L ${payload.installerSource.url}`,
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
                }
              );
            } // Backward ocmpatibility : if (payload.installerSource.url)

            if (payload.installerSource.jsBeat) {
              // New main Filebeat configuration
              const jsbeatConfig = '[]';

              // Build the list of steps
              steps.push(
                {
                  action: 'Check if jsBeat is not already installed',
                  command: 'if [ -e "/opt/jsBeat/bin/start.sh" ]; then echo -e "jsBeat already installed. Exiting."; exit 42; fi;'
                },
                {
                  action: 'Clean up directories left by any previous attemp',
                  command: `if [ -d "/tmp/ez-shipper-install-${payload.jobId}" ]; then rm -rf /tmp/ez-shipper-install-${payload.jobId}; fi;`
                },
                {
                  action: 'Create fresh temporary folder to download installer into',
                  command: `mkdir /tmp/ez-shipper-install-${payload.jobId}`
                },
                {
                  action: `Download package to install (curl -L ${payload.installerSource.jsBeat.url} ...)`,
                  command: `curl -o /tmp/ez-shipper-install-${payload.jobId}/jsBeat.tgz -L ${payload.installerSource.jsBeat.url} -sS -w "Downloaded from: %{url_effective}\nDownloaded to: %{filename_effective}\nResponse Code: %{response_code}\nDownloaded (bytes): %{size_download}\nTotal time taken (seconds): %{time_total}\nAverage download speed (bytes/sec): %{speed_download}\n"`
                },
                {
                  action: `Verify checksum (Good SHA256 is: ${payload.installerSource.jsBeat.sha256})`,
                  command: `sha256sum /tmp/ez-shipper-install-${payload.jobId}/jsBeat.tgz | grep "${payload.installerSource.jsBeat.sha256}"`
                },
                {
                  action: 'Decompress the package',
                  command: `tar xfz /tmp/ez-shipper-install-${payload.jobId}/jsBeat.tgz --directory=/tmp/ez-shipper-install-${payload.jobId}/`
                },
                {
                  action: 'Move jsBeat to /opt/',
                  command: `sudo mv /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.jsBeat.folderName} /opt/`
                },
                {
                  action: 'Remove previous symbolic link to older version, if any',
                  command: 'sudo rm -f /opt/jsBeat',
                  continueOnFailure: true
                },
                {
                  action: 'Create a symbolic link to this version',
                  command: `sudo ln --symbolic ${payload.installerSource.jsBeat.folderName} /opt/jsBeat`
                },
                {
                  action: 'Create configuration file',
                  command: 'cat > /opt/jsBeat/config/log_sources.json',
                  stdin: jsbeatConfig
                },
                {
                  action: 'List the Shipper version(s) from /opt directory',
                  command: 'ls -lda /opt/jsBeat*'
                },
                {
                  action: 'List the files of the Shipper root directory',
                  command: 'ls -la /opt/jsBeat/'
                },
                {
                  action: 'List the files of the Shipper configuration directory',
                  command: 'ls -la /opt/jsBeat/config/'
                },
                {
                  action: 'Run the Shipper post-install script',
                  command: 'sudo /usr/bin/env bash /opt/jsBeat/bin/post_install.sh'
                },
                {
                  action: 'Clean up. Remove the temporary directory and its content',
                  command: `rm -rf /tmp/ez-shipper-install-${payload.jobId}/`
                }
              );
            } // if (payload.installerSource.jsBeat)

            if (
              payload.installerSource.nodeJs
              && payload.installerSource.nodeJs.url
              && payload.installerSource.nodeJs.url.length > 0
              && payload.installerSource.nodeJs.folderName
              && payload.installerSource.nodeJs.folderName.length > 0
              && payload.installerSource.nodeJs.sha256
              && payload.installerSource.nodeJs.sha256.length > 0
            ) {
              steps.push(
                {
                  action: 'Clean up directories left by any previous attemp',
                  command: `if [ -d "/tmp/ez-shipper-install-${payload.jobId}" ]; then rm -rf /tmp/ez-shipper-install-${payload.jobId}; fi;`
                },
                {
                  action: 'Create fresh temporary folder to download installer into',
                  command: `mkdir /tmp/ez-shipper-install-${payload.jobId}`
                },
                {
                  action: `Download package to install (curl -L ${payload.installerSource.nodeJs.url} ...)`,
                  command: `curl -o /tmp/ez-shipper-install-${payload.jobId}/node.tar.gz -L ${payload.installerSource.nodeJs.url} -sS -w "Downloaded from: %{url_effective}\nDownloaded to: %{filename_effective}\nResponse Code: %{response_code}\nDownloaded (bytes): %{size_download}\nTotal time taken (seconds): %{time_total}\nAverage download speed (bytes/sec): %{speed_download}\n"`
                },
                {
                  action: `Verify checksum (Good SHA256 is: ${payload.installerSource.nodeJs.sha256})`,
                  command: `sha256sum /tmp/ez-shipper-install-${payload.jobId}/node.tar.gz | grep "${payload.installerSource.nodeJs.sha256}"`
                },
                {
                  action: 'Decompress the package',
                  command: `tar xfz /tmp/ez-shipper-install-${payload.jobId}/node.tar.gz --directory=/tmp/ez-shipper-install-${payload.jobId}/`
                },
                {
                  action: 'Prepare Lib directory',
                  command: 'mkdir --parents /opt/jsBeat/lib'
                },
                {
                  action: 'Move NodeJS to /opt/jsBeat/lib/',
                  command: `mv /tmp/ez-shipper-install-${payload.jobId}/${payload.installerSource.nodeJs.folderName} /opt/jsBeat/lib/`
                },
                {
                  action: 'Remove previous symbolic link to older version, if any',
                  command: 'sudo rm -f /opt/jsBeat/lib/node',
                  continueOnFailure: true
                },
                {
                  action: 'Create a symbolic link to this version',
                  command: `sudo ln --symbolic ${payload.installerSource.nodeJs.folderName} /opt/jsBeat/lib/node`
                },
                {
                  action: 'List the files of the Shipper Lib directory',
                  command: 'ls -la /opt/jsBeat/lib/'
                },
                {
                  action: 'Clean up. Remove the temporary directory and its content',
                  command: `rm -rf /tmp/ez-shipper-install-${payload.jobId}/`
                }
              );
            } // if (payload.installerSource.nodeJs && ...)

            // Now add the Service start
            if (payload.installerSource.jsBeat) {
              steps.push(
                {
                  action: 'Start Shipper service',
                  command: 'sudo service jsbeat start',
                  continueOnFailure: true
                },
                {
                  action: 'Check Shipper service Status',
                  command: 'sudo service jsbeat status',
                  continueOnFailure: true
                }
              );
            } // if (payload.installerSource.jsBeat)

            // Add the Steps to the Exec stack
            steps.forEach((step, stepCounter) => {
              logToSystem('Debug', `installShipper - Adding step: (${stepCounter}) ${step.action}...`);
              installs[payload.jobId]
                .exec(step.command, {
                  in: step.stdin || '',
                  exit(code) {
                    let continueToNextStep = true;
                    installStepsStatus[payload.jobId].steps[stepCounter].exited = true;
                    installStepsStatus[payload.jobId].steps[stepCounter].endTime = Date.now();

                    if (code !== 0) {
                      installStepsStatus[payload.jobId].steps[stepCounter].failed = true;
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

            logToSystem('Debug', `installShipper - Kicking off Shipper deployment job [${payload.jobId}]...`);
            if (socket.connected) {
              socket.emit('shipper.install',
                {
                  jobId: payload.jobId,
                  code: 'CONTROL.INFO',
                  payload: 'Kicking off Shipper deployment job...',
                  step: 0,
                  totalSteps: steps.length
                });
            }

            // Timestamp of when the job is started
            installStepsStatus[payload.jobId].kickOffTime = Date.now();

            // Enable a fail safe timeout
            const timeoutCheckCycleTime = 2000; // 2 seconds timeout check cycle
            // 5 minutes (300 seconds) timeout max duration for a Step
            const timeoutMaxDurationForStep = 300000;
            if (installStepsStatus[payload.jobId].intervalId == null) {
              installStepsStatus[payload.jobId].intervalId = setInterval(() => {
                logToSystem('Debug', `installShipper - Job [${payload.jobId}] - Monitor cycle...`);
                if (
                  installStepsStatus[payload.jobId]
                ) {
                  // Check how long has the current step running for
                  // (based on previous step end time)
                  const currentStepTookMs = Date.now()
                  - (
                    // Check we are on Step 2 or more (so there is a step before)
                    installStepsStatus[payload.jobId].steps
                    && Array.isArray(installStepsStatus[payload.jobId].steps)
                    && installStepsStatus[payload.jobId].steps.length > 1
                      // If yes, use the endTime of the previous step
                      ? (installStepsStatus[payload.jobId].steps[
                        installStepsStatus[payload.jobId].steps.length - 2
                      ].endTime || 0)
                      // If not, return Job's kickOffTime
                      : installStepsStatus[payload.jobId].kickOffTime
                  );

                  logToSystem('Debug', `installShipper - Job [${payload.jobId}] - Current step (${installStepsStatus[payload.jobId].steps.length}) took ${currentStepTookMs} ms.`);
                  // If it took too long, complain and kill the job
                  if (currentStepTookMs > timeoutMaxDurationForStep) {
                    const errorMessage = (
                      installStepsStatus[payload.jobId].steps.length < 1
                        ? 'Timed out before Step 1. Check Open Collector Host details (host name/IP, port), and make sure it\'s reachable from the EZ Server.'
                        : `Timed out at step: ${installStepsStatus[payload.jobId].steps.length}. As it took ${currentStepTookMs} ms.`
                    );
                    logToSystem('Error', `installShipper - Job [${payload.jobId}] - ${errorMessage}`);
                    if (socket.connected) {
                      socket.emit('shipper.install',
                        {
                          jobId: payload.jobId,
                          code: 'FAILURE',
                          // If we timed out on the first step, provide a more specific message.
                          // eslint-disable-next-line max-len
                          payload: errorMessage,
                          step: null,
                          totalSteps: steps.length
                        });
                    }
                    // eslint-disable-next-line no-use-before-define
                    killInstallShipper(socket, payload);
                  }
                }
              }, timeoutCheckCycleTime);
            }

            // Add Event handlers and start
            installs[payload.jobId]
              .on('end', (err) => {
                logToSystem('Debug', `installShipper - Job [${payload.jobId}] ended. Result: ${err || 'SUCCESS'}`);
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
                  logToSystem('Debug', `installShipper - Job [${payload.jobId}] failed to start.`);
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
      } else {
        if (socket.connected) {
          socket.emit('shipper.install',
            {
              jobId: (payload ? payload.jobId : null),
              code: 'FAILURE',
              payload: 'Job could not start due to missing parameters',
              step: null,
              totalSteps: null
            });
        }
        logToSystem('Error', `installShipper - Job [${payload.jobId}] - Job could not start due to missing parameters`);
      }
    } catch (error) {
      if (socket.connected) {
        socket.emit('shipper.install',
          {
            jobId: payload.jobId,
            code: 'FAILURE',
            payload: `Job failed. Reason: ${error.message}`,
            step: null,
            totalSteps: null
          });
      }
      logToSystem('Error', `installShipper - Job [${payload.jobId}] - Job failed. Reason: ${error.message}`);
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
    // Clearing out the Steps status
    if (installStepsStatus[payload.jobId]) {
      // Ending timeout monitor
      if (installStepsStatus[payload.jobId].intervalId) {
        try {
          logToSystem('Debug', `installShipper - Ending timeout monitor for job [${payload.jobId}]...`);
          clearInterval(installStepsStatus[payload.jobId].intervalId);
        } catch (error) {
          logToSystem('Debug', `installShipper - Failed to end timeout monitor for job [${payload.jobId}]. Error: ${error.message}`);
        } finally {
          installStepsStatus[payload.jobId].intervalId = null;
        }
      }
      installStepsStatus[payload.jobId] = null;
    }

    // Check the jobId exists
    if (installs[payload.jobId]) {
      try {
        logToSystem('Verbose', `installShipper - Ending job [${payload.jobId}]...`);
        installs[payload.jobId].end();
      } catch (error) {
        logToSystem('Error', `installShipper - Failed to end job [${payload.jobId}]. Error: ${error.message}`);
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
