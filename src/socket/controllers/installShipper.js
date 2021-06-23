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
        &&
        (
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
          ||
          (
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
            installs[payload.jobId] = new SSH(JSON.parse(JSON.stringify(sshConfig)));

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
              );
            } // Backward ocmpatibility : if (payload.installerSource.url)

            if (payload.installerSource.jsBeat) {
              // New main Filebeat configuration
              const jsbeatConfig = '[]';

              // Build the list of steps
              steps.push(
                {
                  action: 'Check if jsBeat is not already installed',
                  command: `if [ -e "/opt/jsBeat/bin/start.sh" ]; then echo -e "jsBeat already installed. Exiting."; exit 42; fi;`
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
              )
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
              )
            } // if (payload.installerSource.jsBeat)


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
