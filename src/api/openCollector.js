const { exception } = require('console');
const express = require('express');

const router = express.Router();
// Get SSH config
const fs = require('fs');
const path = require('path');

const configSsh = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'ssh.json'), 'utf8')).config;
// Create SSH object
const SSH = require('simple-ssh');

// Lib to get the SSH config for a given OpenCollector
// const { getSshConfigForCollector } = require('./config');
const { getSshConfigForCollector } = require('../shared/collectorSshConfig');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const maxCheckInterval = 20; // Check once every X seconds max, and/or timeout after X seconds

router.get('/', (req, res) => {
  res.json({
    message: 'API - Open Collector - All good'
  });
});

// #############################################
// CheckOCHelperVersion
// #############################################

router.get('/CheckOCHelperVersion', (req, res) => {
  const version = (process.env.VERSION || '0.0.0').split('.');

  res.json({
    version: {
      detailed: {
        major: (version[0] ? version[0] : 0),
        minor: (version[1] ? version[1] : 0),
        build: (version[2] ? version[2] : 0)
      },
      full: version
    }
  });
});

// #############################################
// CheckOSVersion
// #############################################

const osVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // null (unchecked) or object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const osVersionArray = {};

function checkOSVersion(osVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      osVersion.stillChecking = true;
      osVersion.errors = [];
      osVersion.outputs = [];
      osVersion.payload = null;

      ssh
        .exec('uname -r | awk -F. -v OFS= \'{print "{\\"version\\":{\\"detailed\\":{\\"major\\":\\""$1,"\\", \\"minor\\":\\""$2,"\\", \\"build\\":\\""$3,"\\"}, \\"full\\":\\""$1,"."$2,"."$3,"."$4,"."$5,"\\"}}"}\'', {
          err(stderr) {
            osVersion.errors.push(stderr);
          },
          exit(code) {
            osVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
            try {
              osVersion.payload = JSON.parse(stdout);
            }
            catch (error) {
              osVersion.payload = null;
            }

            osVersion.outputs.push(stdout);
            osVersion.stillChecking = false;
          }
        })
        .on('end', (err) => {
          osVersion.stillChecking = false;
        })
        .start({
          failure() {
            osVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckOSVersion', async (req, res) => {
  if (req && req.query && req.query.uid && req.query.uid.length) {
    const { uid } = req.query;

    if (!osVersionArray[uid]) {
      // osVersionArray[uid] = Object.assign({}, osVersionTemplate);
      osVersionArray[uid] = JSON.parse(JSON.stringify(osVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!osVersionArray[uid].stillChecking) {
        osVersionArray[uid].stillChecking = true;
        checkOSVersion(osVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (osVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !osVersionArray[uid].stillChecking
        && (osVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkOSVersion(osVersionArray[uid], uid);
      }
    }

    if (osVersionArray[uid].payload) {
      osVersionArray[uid].payload.uid = uid;
    }
    res.json(osVersionArray[uid]);
  } else {
    res.json(Object.assign(Object.assign({}, osVersionTemplate), { errors: ['Missing UID in Query.']}));
  }
});

// #############################################
// CheckFilebeatVersion
// #############################################

const fbVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // null (unchecked) or object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const fbVersionArray = {};

function checkfbVersion(fbVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      fbVersion.stillChecking = true;
      fbVersion.errors = [];
      fbVersion.outputs = [];
      fbVersion.payload = null;

      ssh
        .exec('filebeat version | sed \'s/^.*[^0-9]\\([0-9]*\\.[0-9]*\\.[0-9]*\\).*$/\\1/\' | awk -F- \'{print "{\\"version\\":{\\"full\\":\\""$1"\\"}}"}\'', {
          err(stderr) {
            fbVersion.errors.push(stderr);
          },
          exit(code) {
            fbVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
            try {
              fbVersion.payload = JSON.parse(stdout);
            }
            catch (error) {
              fbVersion.payload = null;
            }

            fbVersion.outputs.push(stdout);
            fbVersion.stillChecking = false;
          }
        })
        .on('end', (err) => {
          fbVersion.stillChecking = false;
        })
        .start({
          failure() {
            fbVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckFilebeatVersion', async (req, res) => {
  if (req && req.query && req.query.uid && req.query.uid.length) {
    const { uid } = req.query;

    if (!fbVersionArray[uid]) {
      // fbVersionArray[uid] = Object.assign({}, fbVersionTemplate);
      fbVersionArray[uid] = JSON.parse(JSON.stringify(fbVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!fbVersionArray[uid].stillChecking) {
        fbVersionArray[uid].stillChecking = true;
        checkfbVersion(fbVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (fbVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !fbVersionArray[uid].stillChecking
        && (fbVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkfbVersion(fbVersionArray[uid], uid);
      }
    }

    if (fbVersionArray[uid].payload) {
      fbVersionArray[uid].payload.uid = uid;
    }
    res.json(fbVersionArray[uid]);
  } else {
    res.json(Object.assign(Object.assign({}, fbVersionTemplate), { errors: ['Missing UID in Query.']}));
  }
});

// #############################################
// CheckOpenCollectorAndBeatsVersions
// #############################################

const ocAndBeatsVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // null (unchecked) or object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const ocAndBeatsVersionArray = {};

function checkOcBeatsVersion(ocAndBeatsVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      ocAndBeatsVersion.stillChecking = true;
      ocAndBeatsVersion.errors = [];
      ocAndBeatsVersion.outputs = [];
      ocAndBeatsVersion.payload = null;

      ssh
        // .exec('./lrctl status | grep -i "^.*beat\\\\s\\+[0-9.]\\+" -o | awk \'BEGIN { ORS = ""; print "[" } { print "{\\"name\\":\\""$1"\\"},{\\"version\\":{\\"full\\":\\""$2"\\"}},"} END { ORS = "\\n"; print "]" } \' | sed \'s/},]/}]/\'', {
        .exec('./lrctl status | grep -i "^\\(.*beat\\|open_collector\\)\\\\s\\+[0-9.]\\+" -o | awk \'BEGIN { ORS = ""; print "[" } { print "{\\"name\\":\\""$1"\\",\\"version\\":{\\"full\\":\\""$2"\\"}},"} END { ORS = "\\n"; print "]" } \' | sed \'s/},]/}]/\'', {
          err(stderr) {
            ocAndBeatsVersion.errors.push(stderr);
          },
          exit(code) {
            ocAndBeatsVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
            try {
              ocAndBeatsVersion.payload = JSON.parse(stdout);
            }
            catch (error) {
              ocAndBeatsVersion.payload = null;
            }

            ocAndBeatsVersion.outputs.push(stdout);
            ocAndBeatsVersion.stillChecking = false;
          }
        })
        .on('end', (err) => {
          ocAndBeatsVersion.stillChecking = false;
        })
        .start({
          failure() {
            ocAndBeatsVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckOpenCollectorAndBeatsVersions', async (req, res) => {
  if (req && req.query && req.query.uid && req.query.uid.length) {
    const { uid } = req.query;

    if (!ocAndBeatsVersionArray[uid]) {
      // ocAndBeatsVersionArray[uid] = Object.assign({}, ocAndBeatsVersionTemplate);
      ocAndBeatsVersionArray[uid] = JSON.parse(JSON.stringify(ocAndBeatsVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!ocAndBeatsVersionArray[uid].stillChecking) {
        ocAndBeatsVersionArray[uid].stillChecking = true;
        checkOcBeatsVersion(ocAndBeatsVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (ocAndBeatsVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !ocAndBeatsVersionArray[uid].stillChecking
        && (ocAndBeatsVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkOcBeatsVersion(ocAndBeatsVersionArray[uid], uid);
      }
    }

    if (ocAndBeatsVersionArray[uid].payload) {
      ocAndBeatsVersionArray[uid].payload.uid = uid;
    }
    res.json(ocAndBeatsVersionArray[uid]);
  } else {
    res.json(Object.assign(Object.assign({}, ocAndBeatsVersionTemplate), { errors: ['Missing UID in Query.']}));
  }
});

// #############################################
// CheckJsBeatVersion
// #############################################

const jsBeatVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } }, // object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const jsBeatVersionArray = {};

function checkjsBeatVersion (jsBeatVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      jsBeatVersion.stillChecking = true;
      jsBeatVersion.errors = [];
      jsBeatVersion.outputs = [];
      jsBeatVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };

      ssh
        .exec('/opt/jsBeat/bin/start.sh --version | grep -i jsbeat 2>/dev/null', {
          err (stderr) {
            jsBeatVersion.errors.push(stderr);
          },
          exit (code) {
            jsBeatVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out (stdout) {
            const version = stdout.match(/js[Bb]eat *(([0-9]+)\.([0-9]+)\.([0-9]+))/);
            if (version.length > 0) {
              jsBeatVersion.payload = {
                name: 'jsBeat',
                version: {
                  detailed: { major: version[2], minor: version[3], build: version[4] },
                  full: version[1]
                }
              };
            } else {
              jsBeatVersion.payload = { name: 'jsBeat', version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };
            }
            jsBeatVersion.outputs.push(stdout);
          }
        })
        .on('end', (err) => {
          jsBeatVersion.stillChecking = false;
        })
        .start({
          failure () {
            jsBeatVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckJsBeatVersion', async (req, res) => {
  if (req && req.query && req.query.uid && req.query.uid.length) {
    const { uid } = req.query;

    if (!jsBeatVersionArray[uid]) {
      // jsBeatVersionArray[uid] = Object.assign({}, jsBeatVersionTemplate);
      jsBeatVersionArray[uid] = JSON.parse(JSON.stringify(jsBeatVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!jsBeatVersionArray[uid].stillChecking) {
        jsBeatVersionArray[uid].stillChecking = true;
        checkjsBeatVersion(jsBeatVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (jsBeatVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !jsBeatVersionArray[uid].stillChecking
        && (jsBeatVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkjsBeatVersion(jsBeatVersionArray[uid], uid);
      }
    }

    if (jsBeatVersionArray[uid].payload) {
      jsBeatVersionArray[uid].payload.uid = uid;
    }
    res.json(jsBeatVersionArray[uid]);
  } else {
    res.json(Object.assign(Object.assign({}, jsBeatVersionTemplate), { errors: ['Missing UID in Query.'] }));
  }
});

// #############################################
// CheckDockerPresence
// #############################################

var dockerPresence = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { presence: false }, // object with presence
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkDockerPresence () {
  var ssh = new SSH(configSsh);

  dockerPresence.stillChecking = true;
  dockerPresence.errors = [];
  dockerPresence.outputs = [];
  dockerPresence.payload = { presence: false };

  ssh
    .exec('docker -v >/dev/null 2>/dev/null || exit 1', {
      err: function(stderr) {
        dockerPresence.errors.push(stderr);
      },
      exit: function(code) {
        dockerPresence.payload.presence = (code === 1 ? false : true);
        dockerPresence.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        dockerPresence.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      dockerPresence.stillChecking = false;
    })
    .start({
      failure: function () {
        dockerPresence.stillChecking = false;
      }
    });
}

router.get('/CheckDockerPresence', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!dockerPresence.stillChecking) {
      checkDockerPresence();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (dockerPresence.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!dockerPresence.stillChecking && (dockerPresence.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkDockerPresence();
    }
  }
  
  res.json(dockerPresence);

});

// #############################################
// CheckDockerVersion
// #############################################

var dockerVersion = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } }, // object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkDockerVersion () {
  var ssh = new SSH(configSsh);

  dockerVersion.stillChecking = true;
  dockerVersion.errors = [];
  dockerVersion.outputs = [];
  dockerVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };

  ssh
    .exec('docker -v 2>/dev/null || exit 1', {
      err: function(stderr) {
        dockerVersion.errors.push(stderr);
      },
      exit: function(code) {
        dockerVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        version = stdout.match(/.*?\s+(([0-9]+)\.([0-9]+)\.([0-9]+))/);
        if (version.length > 0) {
          dockerVersion.payload = { version: { detailed: { major: version[2], minor: version[3], build: version[4] }, Full: version[1] } };
        } else
        {
          dockerVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };
        }
        dockerVersion.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      dockerVersion.stillChecking = false;
    })
    .start({
      failure: function () {
        dockerVersion.stillChecking = false;
      }
    });
}

router.get('/CheckDockerVersion', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!dockerVersion.stillChecking) {
      checkDockerVersion();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (dockerVersion.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!dockerVersion.stillChecking && (dockerVersion.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkDockerVersion();
    }
  }
  
  res.json(dockerVersion);

});

// #############################################
// CheckOCPresence
// #############################################

var ocPresence = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  lrtclPresent: null, // null (unchecked), true or false
  lrtclCanRun: null, // null (unchecked), true or false
  ocPresent: null, // null (unchecked), true or false
  ocVersion: null, // null (unchecked) or string with version
  ocStatus: null, // null (unchecked) or string with status
  payload: { presence: false }, // object with presence
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkOCPresence () {
  var ssh = new SSH(configSsh);
  ocPresence.stillChecking = true;
  ocPresence.errors = [];
  ocPresence.outputs = [];
  ocPresence.payload.presence = false;

  ssh
    .exec('ls lrctl >/dev/null 2>/dev/null || exit 1', {
      err: function(stderr) {
        ocPresence.errors.push(stderr);
      },
      exit: function(code) {
        ocPresence.lrtclPresent = (code === 1 ? false : true);
        return ocPresence.lrtclPresent;
      },
      out: function(stdout) {
        ocPresence.outputs.push(stdout);
      }
    })
    .exec('./lrctl --help >/dev/null 2>/dev/null || exit 1', {
      err: function(stderr) {
        ocPresence.errors.push(stderr);
      },
      exit: function(code) {
        ocPresence.lrtclCanRun = (code === 1 ? false : true);
        return ocPresence.lrtclCanRun;
      },
      out: function(stdout) {
        ocPresence.outputs.push(stdout);
      }
    })
    .exec('./lrctl status | grep -c -i open_collector 2>/dev/null || exit 1', {
      err: function(stderr) {
        ocPresence.errors.push(stderr);
      },
      exit: function(code) {
        ocPresence.ocPresent = (code === 1 ? false : true);
        ocPresence.payload.presence = ocPresence.ocPresent;
        return ocPresence.ocPresent;
      },
      out: function(stdout) {
        ocPresence.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      ocPresence.stillChecking = false;
      ocPresence.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
    })
    .start({
      failure: function () {
        ocPresence.stillChecking = false;
      }
    });
}

router.get('/CheckOCPresence', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocPresence.stillChecking) {
      checkOCPresence();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval
    while (ocPresence.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!ocPresence.stillChecking && (ocPresence.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkOCPresence();
    }
  }

  res.json(ocPresence);

});

// #############################################
// CheckOCVersion
// #############################################

const ocVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } }, // object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const ocVersionArray = {};

function checkOCVersion(ocVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      ocVersion.stillChecking = true;
      ocVersion.errors = [];
      ocVersion.outputs = [];
      ocVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };

      ssh
        .exec('./lrctl status 2>/dev/null | grep -i open_collector 2>/dev/null', {
          err(stderr) {
            ocVersion.errors.push(stderr);
          },
          exit(code) {
            ocVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
            const version = stdout.match(/open_collector *(([0-9]+)\.([0-9]+)\.([0-9]+))/);
            if (version.length > 0) {
              ocVersion.payload = {
                version: {
                  detailed: { major: version[2], minor: version[3], build: version[4] },
                  full: version[1]
                }
              };
            } else
            {
              ocVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };
            }
            ocVersion.outputs.push(stdout);
          }
        })
        .on('end', (err) => {
          ocVersion.stillChecking = false;
        })
        .start({
          failure() {
            ocVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckOCVersion', async (req, res) => {
  if (req && req.query && req.query.uid && req.query.uid.length) {
    const { uid } = req.query;

    if (!ocVersionArray[uid]) {
      // ocVersionArray[uid] = Object.assign({}, ocVersionTemplate);
      ocVersionArray[uid] = JSON.parse(JSON.stringify(ocVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!ocVersionArray[uid].stillChecking) {
        ocVersionArray[uid].stillChecking = true;
        checkOCVersion(ocVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (ocVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !ocVersionArray[uid].stillChecking
        && (ocVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkOCVersion(ocVersionArray[uid], uid);
      }
    }

    if (ocVersionArray[uid].payload) {
      ocVersionArray[uid].payload.uid = uid;
    }
    res.json(ocVersionArray[uid]);
  } else {
    res.json(Object.assign(Object.assign({}, ocVersionTemplate), { errors: ['Missing UID in Query.']}));
  }
});

// #############################################
// CheckOCHealth
// #############################################

var ocHealth = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { health: '' }, // object with health
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkOCHealth () {
  var ssh = new SSH(configSsh);

  ocHealth.stillChecking = true;
  ocHealth.errors = [];
  ocHealth.outputs = [];
  ocHealth.payload = { health: '' };

  ssh
    .exec('./lrctl status 2>/dev/null | grep -i open_collector 2>/dev/null', {
      err: function(stderr) {
        ocHealth.errors.push(stderr);
      },
      exit: function(code) {
        ocHealth.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        health = stdout.match(/open_collector *[0-9]+\.[0-9]+\.[0-9]+ *[0-9]+-[0-9]+-[0-9]+ +[0-9]+:[0-9]+:[0-9]+ +\+[0-9]+ +UTC +(\w*)/);
        if (health.length > 0) {
          ocHealth.payload = { health: health[1] };
        } else
        {
          ocHealth.payload = { health: '' };
        }
        ocHealth.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      ocHealth.stillChecking = false;
    })
    .start({
      failure: function () {
        ocHealth.stillChecking = false;
      }
    });
}

router.get('/CheckOCHealth', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocHealth.stillChecking) {
      checkOCHealth();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (ocHealth.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!ocHealth.stillChecking && (ocHealth.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkOCHealth();
    }
  }
  
  res.json(ocHealth);

});

// #############################################
// ReadOCConfiguration
// #############################################

var ocConfiguration = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: '', // raw output
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function readOcConfiguration () {
  var ssh = new SSH(configSsh);

  ocConfiguration.stillChecking = true;
  ocConfiguration.errors = [];
  ocConfiguration.outputs = [];
  ocConfiguration.payload = '';

  ssh
    .exec('./lrctl open-collector config export 2>/dev/null', {
      err: function(stderr) {
        ocConfiguration.errors.push(stderr);
      },
      exit: function(code) {
        ocConfiguration.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        ocConfiguration.payload = stdout;
        ocConfiguration.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      ocConfiguration.stillChecking = false;
    })
    .start({
      failure: function () {
        ocConfiguration.stillChecking = false;
      }
    });
}

router.get('/ReadOcConfiguration', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocConfiguration.stillChecking) {
      readOcConfiguration();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (ocConfiguration.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!ocConfiguration.stillChecking && (ocConfiguration.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      readOcConfiguration();
    }
  }

  if (req.query.Raw === undefined || (req.query.Raw !== undefined && req.query.Raw.toLowerCase() === 'false')) {
    // Send as JSON
    res.json(ocConfiguration);
  } else {
    // Send RAW
    res.send(ocConfiguration.payload);
  }

});


// #############################################
// UpdateStreamConfigurationForBeat
// #############################################

const streamUpdateForBeatStatusTemplate = {
  stillUpdating: false,
  lastSuccessfulUpdateTimeStampUtc: 0,
  payload: {}, // object with result of the operation
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const streamUpdateForBeatStatusArray = {};

function updateStreamConfigurationForBeat (streamUpdateForBeatStatus, openCollector, beat, stream) {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(openCollector && openCollector.uid && openCollector.uid.length)
  const missingBeat = !(beat && beat.name && beat.name.length && beat.config && Array.isArray(beat.config))
  const missingStream = !(stream && stream.uid && stream.uid.length)
  if (
    !missingOpenCollector &&
    !missingBeat &&
    !missingStream
    ) {
    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      streamUpdateForBeatStatus.stillUpdating = true;
      streamUpdateForBeatStatus.errors = [];
      streamUpdateForBeatStatus.outputs = [];
      streamUpdateForBeatStatus.payload = {};

      // ####################################################################################################

      try  {
        // Initialise the empty list of Steps
        const steps = [];

        // Config file name will be escaped (to only letters, numbers, dashes and underscores) to 
        // not cause issues on the file system. Any non autorised chars will be replaced by "_".
        // It is built using:
        // - Stream Name
        // - "__"
        // - Stream UID
        const configFileNameBase = String(`${stream.name}__${stream.uid}`).replace(/[^a-zA-Z0-9_-]/g, '_');

        // To avoid any risk of deleting unrelated files, we bail if the configFileNameBase is empty
        if (configFileNameBase.length === 0) {
          throw new Error('configFileNameBase too short (Stream Name and UID must be non-empty)');
        }

        // Let's use file numbering only if there are more than one configuration file provided
        const multipleFiles = beat.config.length > 1;

        // ##########
        // Filebeat
        // ##########
        if (beat.name.toLowerCase() === 'filebeat') {
          // Build the list of steps

          steps.push(
            {
              action: 'Create new Input folder to drop dynamic input files into, in case it\'s missing',
              command: 'if ! [ -d "/etc/filebeat/inputs.d" ]; then sudo mkdir -p /etc/filebeat/inputs.d ; fi;'
            },
            {
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.yml -> *.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.yml; do if [ -f "$f" ]; then mv -- "$f" "\${f%.yml}.bak" ; fi ; done ;`,
              continueOnFailure: true
            }
          );

          // Add the different Configuration file(s)
          beat.config.forEach((config, number) => {
            const fileNumber = (multipleFiles ? '__' + String(number + 1).padStart(3, '0') : '');

            // Adding file number, if any to the base file name. It is built using:
            // - configFileNameBase
            // - "__"
            // - Filenumber
            const configFileName = String(`${configFileNameBase}${fileNumber}`);

            steps.push(
              {
                action: `Create Stream configuration file (${configFileName}.yml)`,
                command: `cat > /etc/filebeat/inputs.d/${configFileName}.yml`,
                stdin: (typeof config === 'string' ? config : JSON.stringify(config))
              },
              {
                action: 'Set Stream configuration file the correct access rights',
                command: `sudo chmod 600 /etc/filebeat/inputs.d/${configFileName}.yml`
              },
              {
                action: 'Dump Stream configuration file',
                command: `sudo cat /etc/filebeat/inputs.d/${configFileName}.yml`
              }
            );
          });

          // Wrap up
          steps.push(
            {
              action: 'List the Stream files of the config directory',
              command: 'ls -la "/etc/filebeat/inputs.d/${configFileNameBase}"*'
            }
          );
          streamUpdateForBeatStatus.payload.steps = steps;
        }

        // ##########
        // jsBeat
        // ##########
        if (beat.name.toLowerCase() === 'jsbeat') {
          // Build a unique path to use a Symbolic link to the installation folder of jsBeat
          // Most people will deploy it under /opt/jsBeat, but we plan for all the cases
          const cleanTimestamp = new Date().toISOString().replace(/[^a-zA-Z0-9_-]/g, '_');
          const tempSymbolicLinkPath = `/tmp/${configFileNameBase}__${cleanTimestamp}`;
          // Build the list of steps
          
          steps.push(
            {
              action: 'Create Symbolic link to the installation folder of jsBeat',
              command: `jsBeatPath=$(systemctl show jsbeat | grep "^ExecStart" | head -n 1 | sed -E 's/\\s+;\\s+/🏁/g' | sed -E 's/(^.*path=([^🏁]+).*)/\\2/' | sed -E 's_/bin/.*__') ; if [ -z "$jsBeatPath" ]; then echo -E "Could not find jsBeat path (using 'systemctl show jsbeat'). Stopping now."; exit 42; else echo -E "jsBeat found at: $jsBeatPath"; ln -s $jsBeatPath ${tempSymbolicLinkPath} ; fi`
            },
            {
              action: 'Create new Input folder to drop dynamic input files into, in case it\'s missing',
              command: `if ! [ -d "${tempSymbolicLinkPath}/config/inputs.d" ]; then sudo mkdir -p ${tempSymbolicLinkPath}/config/inputs.d ; fi;`
            },
            {
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.json -> *.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.json; do if [ -f "$f" ]; then mv -- "$f" "\${f%.json}.bak" ; fi ; done ;`,
              continueOnFailure: true
            }
          );

          // Add the different Configuration file(s)
          beat.config.forEach((config, number) => {
            const fileNumber = (multipleFiles ? '__' + String(number + 1).padStart(3, '0') : '');

            // Adding file number, if any to the base file name. It is built using:
            // - configFileNameBase
            // - "__"
            // - Filenumber
            const configFileName = String(`${configFileNameBase}${fileNumber}`);

            steps.push(
              {
                action: `Create Stream configuration file (${configFileName}.json)`,
                command: `cat > ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`,
                stdin: (typeof config === 'string' ? config : JSON.stringify(config))
              },
              {
                action: `Set Stream configuration file the correct access rights (${configFileName}.json)`,
                command: `sudo chmod 640 ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`
              },
              {
                action: `Dump Stream configuration file (${configFileName}.json)`,
                command: `sudo cat ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`
              }
            );
          });

          // Wrap up
          steps.push(
            {
              action: 'List the Stream files of the config directory',
              command: `ls -la "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*`
            },
            {
              action: 'Delete the created Symbolic link to the installation folder of jsBeat',
              command: `rm -f "${tempSymbolicLinkPath}"`
            },
            {
              action: 'Restart jsBeat to take new configuration files into account',
              command: 'sudo systemctl restart jsbeat'
            }
          );
          streamUpdateForBeatStatus.payload.steps = steps;
        }

        // ##########
        // lrHttpRest
        // ##########
        if (beat.name.toLowerCase() === 'lrhttprest') {
          //
        }

        // Add the Steps to the Exec stack
        steps.forEach((step, stepCounter) => {
          // eslint-disable-next-line no-console
          // console.log(`updateStreamConfigurationForBeat - Adding step: (${stepCounter}) ${step.action}...`);
          logToSystem('Debug', `updateStreamConfigurationForBeat - Adding step: (${stepCounter}) ${step.action}...`);

          // Add space to record result ofthe action (return code, STDOUT, STDERR, ...)
          streamUpdateForBeatStatus.payload.steps[stepCounter].result = {
            errors: [],
            outputs: [],
            exitCode: undefined,
            failed: undefined
          }

          ssh
            .exec(step.command, {
              in: step.stdin || '',
              exit (code) {
                let continueToNextStep = true;
                logToSystem('Debug', `updateStreamConfigurationForBeat - EXEC: (${code}) - ${step.command}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.exitCode = code;
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.failed = false;

                if (code !== 0) {
                  // if (socket.connected) {
                  //   socket.emit('shipper.install',
                  //     {
                  //       jobId: payload.jobId,
                  //       code: 'ERROR',
                  //       payload: 'STEP FAILED',
                  //       step: stepCounter + 1,
                  //       totalSteps: steps.length
                  //     });
                  //   socket.emit('shipper.install',
                  //     {
                  //       jobId: payload.jobId,
                  //       code: 'EXIT',
                  //       payload: `Return code: ${code}`,
                  //       step: stepCounter + 1,
                  //       totalSteps: steps.length
                  //     });
                  // }

                  streamUpdateForBeatStatus.errors.push(`Step ${stepCounter} failed with return code (${code}) - Command was: ${step.command}`);
                  streamUpdateForBeatStatus.payload.steps[stepCounter].result.failed = true;
                  continueToNextStep = false;
                  // Set the whole job as failed, except if we are meant to continueOnFailure for this step
                  streamUpdateForBeatStatus.payload.success = !!(false | step.continueOnFailure)
                } // if (code !== 0) {

                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'FINISHED',
                //       payload: step.action,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }

                // Check if need to force Continue
                if (step.continueOnFailure === true) {
                  continueToNextStep = true;
                }

                return continueToNextStep;
              },
              err (stderr) {
                // streamUpdateForBeatStatus.errors.push(stderr);
                logToSystem('Debug', `updateStreamConfigurationForBeat - STDERR: ${stderr}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.errors.push(stderr);
                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'STDERR',
                //       payload: stderr,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }
              },
              out (stdout) {
                // streamUpdateForBeatStatus.outputs.push(stdout);
                logToSystem('Debug', `updateStreamConfigurationForBeat - STDOUT: ${stdout}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.outputs.push(stdout);
                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'STDOUT',
                //       payload: stdout,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }
              }
            });
        });

        // Add Event handlers and start
        ssh
          .on('end', (err) => {
            logToSystem('Debug', `updateStreamConfigurationForBeat - END: (${err})`);
            if (err) {
              streamUpdateForBeatStatus.error.push(err);
            } else {
              //  If Success is not already set to False, then set it to true
              if (streamUpdateForBeatStatus.payload.success !== false) {
                streamUpdateForBeatStatus.payload.success = true;
              }
            }
            streamUpdateForBeatStatus.stillUpdating = false;

            // Cleanup the sessions
            // // eslint-disable-next-line no-use-before-define
            // killInstallShipper(socket, payload);
            // if (socket.connected) {
            //   socket.emit('shipper.install',
            //     {
            //       jobId: payload.jobId,
            //       code: 'END',
            //       payload: err || 'SUCCESS',
            //       step: null,
            //       totalSteps: steps.length
            //     });
            // }
          })
          .start({
            failure () {
              streamUpdateForBeatStatus.error.push('FAILURE - Job could not start');
              streamUpdateForBeatStatus.stillUpdating = false;

              // // Cleanup the sessions
              // // eslint-disable-next-line no-use-before-define
              // killInstallShipper(socket, payload);
              // if (socket.connected) {
              //   socket.emit('shipper.install',
              //     {
              //       jobId: payload.jobId,
              //       code: 'FAILURE',
              //       payload: 'Job could not start',
              //       step: null,
              //       totalSteps: steps.length
              //     });
              // }
            }
          });

      } catch (errorCaught) {
        streamUpdateForBeatStatus.errors.push('Exception: ' + errorCaught.message);
      } finally {
        //
      }
    }).catch(() => {
      streamUpdateForBeatStatus.errors.push(`Failed to get SSH configuration for OpenCollector (based on provided UID: ${openCollector.uid}).`);
      streamUpdateForBeatStatus.stillUpdating = false;
    });
  } else {
    streamUpdateForBeatStatus.errors.push('[updateStreamConfigurationForBeat] Missing parameter(s). See following errors.');
    if (missingOpenCollector) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "opencCollector" object.');
    }
    if (missingBeat) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "beat" object.');
    }
    if (missingStream) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "stream" object.');
    }
    streamUpdateForBeatStatus.stillUpdating = false;
  }
  /* eslint-enable no-param-reassign */
}

router.post('/UpdateStreamConfigurationForBeat', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(req && req.body && req.body.openCollector && req.body.openCollector.uid && req.body.openCollector.uid.length)
  const missingBeat = !(req && req.body && req.body.beat && req.body.beat.name && req.body.beat.name.length && req.body.beat.config && Array.isArray(req.body.beat.config))
  const missingStream = !(req && req.body && req.body.stream && req.body.stream.uid && req.body.stream.uid.length)
  if (
    !missingOpenCollector &&
    !missingBeat &&
    !missingStream
  ) {
    const { openCollector, beat, stream } = req.body;

    if (!streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]) {
      // streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = Object.assign({}, streamUpdateForBeatStatusTemplate);
      streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = JSON.parse(JSON.stringify(streamUpdateForBeatStatusTemplate));
    }

    if (req.body.NoWait === undefined || (req.body.NoWait !== undefined && req.body.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating) {
        streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating = true;
        updateStreamConfigurationForBeat(streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating
        && (streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].lastSuccessfulUpdateTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        updateStreamConfigurationForBeat(streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
    }

    if (streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].payload) {
      // streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].payload.params = {
      //   openCollector,
      //   beat,
      //   stream
      // };
    }
    res.json(streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]);
  } else {
    const errorMessages = []; //['Missing parameters in Body (Both `openCollector`, `beat` and `stream` objects are compulstory and must be properly populated).. See following errors.']
    if (missingOpenCollector) {
      errorMessages.push('Missing or malformed compulstory "opencCollector" object.');
    }
    if (missingBeat) {
      errorMessages.push('Missing or malformed compulstory "beat" object.');
    }
    if (missingStream) {
      errorMessages.push('Missing or malformed compulstory "stream" object.');
    }


    res.json(Object.assign(Object.assign({}, streamUpdateForBeatStatusTemplate), { errors: errorMessages }, { requestBody: req.body }));
  }
});

// #############################################
// ImportPipelineForBeat
// #############################################

// Bash process:
// rm -rf /tmp/12345
// mkdir /tmp/12345
// tar xvfz /root/u/EZ_stream_placeholder.tgz --directory=/tmp/12345/
// cat ~/NEW_stream_placeholder/is_NEW_stream_placeholder.jq | cat > /tmp/12345/EZ_stream_placeholder/is_NEW_stream_placeholder.jq
// cat ~/NEW_stream_placeholder/NEW_stream_placeholder.jq | cat > /tmp/12345/EZ_stream_placeholder/NEW_stream_placeholder.jq
// sed --in-place 's/EZ_stream_placeholder/NEW_stream_placeholder/g' /tmp/12345/EZ_stream_placeholder/include.jq /tmp/12345/EZ_stream_placeholder/ocpipeline.root /tmp/12345/EZ_stream_placeholder/tests/testdata/general.json /tmp/12345/EZ_stream_placeholder/tests/testdata/EZ_stream_placeholder.json /tmp/12345/EZ_stream_placeholder/tests/EZ_stream_placeholder_test.jq /tmp/12345/EZ_stream_placeholder/tests/log_type_test.jq /tmp/12345/EZ_stream_placeholder/tests/is_EZ_stream_placeholder_test.jq /tmp/12345/EZ_stream_placeholder/transform.jq
// mv /tmp/12345/EZ_stream_placeholder/tests/EZ_stream_placeholder_test.jq /tmp/12345/EZ_stream_placeholder/tests/NEW_stream_placeholder_test.jq
// mv /tmp/12345/EZ_stream_placeholder/tests/is_EZ_stream_placeholder_test.jq /tmp/12345/EZ_stream_placeholder/tests/is_NEW_stream_placeholder_test.jq
// mv /tmp/12345/EZ_stream_placeholder/tests/testdata/EZ_stream_placeholder.json /tmp/12345/EZ_stream_placeholder/tests/testdata/NEW_stream_placeholder.json
// mv /tmp/12345/EZ_stream_placeholder /tmp/12345/NEW_stream_placeholder
// find /tmp/12345/NEW_stream_placeholder/* -mtime -1 -type f | sed 's_/tmp/12345/__' | tar cvzf /tmp/12345/NEW_stream_placeholder.tgz --directory=/tmp/12345/ --files-from=/dev/stdin --owner=0 --group=0 --mode='666'
// tar tvfz /tmp/12345/NEW_stream_placeholder.tgz
// cat /tmp/12345/NEW_stream_placeholder.tgz | ./lrctl oc pipe import
// rm -rf /tmp/12345


const pipelineImportForBeatStatusTemplate = {
  stillUpdating: false,
  lastSuccessfulUpdateTimeStampUtc: 0,
  payload: {}, // object with result of the operation
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const pipelineImportForBeatStatusArray = {};

function importPipelineForBeat (pipelineImportForBeatStatus, openCollector, beat, stream) {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(openCollector && openCollector.uid && openCollector.uid.length)
  const missingBeat = !(beat && beat.name && beat.name.length && beat.config && Array.isArray(beat.config))
  const missingStream = !(stream && stream.uid && stream.uid.length)
  if (
    !missingOpenCollector &&
    !missingBeat &&
    !missingStream
    ) {
    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      pipelineImportForBeatStatus.stillUpdating = true;
      pipelineImportForBeatStatus.errors = [];
      pipelineImportForBeatStatus.outputs = [];
      pipelineImportForBeatStatus.payload = {};

      // ####################################################################################################

      try  {
        // Initialise the empty list of Steps
        const steps = [];

        // Config file name will be escaped (to only letters, numbers, dashes and underscores) to 
        // not cause issues on the file system. Any non autorised chars will be replaced by "_".
        // It is built using:
        // - Stream Name
        // - "__"
        // - Stream UID
        const configFileNameBase = String(`${stream.name}__${stream.uid}`).replace(/[^a-zA-Z0-9_-]/g, '_');

        // To avoid any risk of deleting unrelated files, we bail if the configFileNameBase is empty
        if (configFileNameBase.length === 0) {
          throw new Error('configFileNameBase too short (Stream Name and UID must be non-empty)');
        }

        // Let's use file numbering only if there are more than one configuration file provided
        const multipleFiles = beat.config.length > 1;

        // ##########
        // Filebeat
        // ##########
        if (beat.name.toLowerCase() === 'filebeat') {
          // Build the list of steps

          steps.push(
            {
              action: 'Create new Input folder to drop dynamic input files into, in case it\'s missing',
              command: 'if ! [ -d "/etc/filebeat/inputs.d" ]; then sudo mkdir -p /etc/filebeat/inputs.d ; fi;'
            },
            {
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.yml -> *.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.yml; do if [ -f "$f" ]; then mv -- "$f" "\${f%.yml}.bak" ; fi ; done ;`,
              continueOnFailure: true
            }
          );

          // Add the different Configuration file(s)
          beat.config.forEach((config, number) => {
            const fileNumber = (multipleFiles ? '__' + String(number + 1).padStart(3, '0') : '');

            // Adding file number, if any to the base file name. It is built using:
            // - configFileNameBase
            // - "__"
            // - Filenumber
            const configFileName = String(`${configFileNameBase}${fileNumber}`);

            steps.push(
              {
                action: `Create Stream configuration file (${configFileName}.yml)`,
                command: `cat > /etc/filebeat/inputs.d/${configFileName}.yml`,
                stdin: (typeof config === 'string' ? config : JSON.stringify(config))
              },
              {
                action: 'Set Stream configuration file the correct access rights',
                command: `sudo chmod 600 /etc/filebeat/inputs.d/${configFileName}.yml`
              },
              {
                action: 'Dump Stream configuration file',
                command: `sudo cat /etc/filebeat/inputs.d/${configFileName}.yml`
              }
            );
          });

          // Wrap up
          steps.push(
            {
              action: 'List the Stream files of the config directory',
              command: 'ls -la "/etc/filebeat/inputs.d/${configFileNameBase}"*'
            }
          );
          pipelineImportForBeatStatus.payload.steps = steps;
        }

        // ##########
        // jsBeat
        // ##########
        if (beat.name.toLowerCase() === 'jsbeat') {
          // Build a unique path to use a Symbolic link to the installation folder of jsBeat
          // Most people will deploy it under /opt/jsBeat, but we plan for all the cases
          const cleanTimestamp = new Date().toISOString().replace(/[^a-zA-Z0-9_-]/g, '_');
          const tempSymbolicLinkPath = `/tmp/${configFileNameBase}__${cleanTimestamp}`;
          // Build the list of steps
          
          steps.push(
            {
              action: 'Create Symbolic link to the installation folder of jsBeat',
              command: `jsBeatPath=$(systemctl show jsbeat | grep "^ExecStart" | head -n 1 | sed -E 's/\\s+;\\s+/🏁/g' | sed -E 's/(^.*path=([^🏁]+).*)/\\2/' | sed -E 's_/bin/.*__') ; if [ -z "$jsBeatPath" ]; then echo -E "Could not find jsBeat path (using 'systemctl show jsbeat'). Stopping now."; exit 42; else echo -E "jsBeat found at: $jsBeatPath"; ln -s $jsBeatPath ${tempSymbolicLinkPath} ; fi`
            },
            {
              action: 'Create new Input folder to drop dynamic input files into, in case it\'s missing',
              command: `if ! [ -d "${tempSymbolicLinkPath}/config/inputs.d" ]; then sudo mkdir -p ${tempSymbolicLinkPath}/config/inputs.d ; fi;`
            },
            {
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.json -> *.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.json; do if [ -f "$f" ]; then mv -- "$f" "\${f%.json}.bak" ; fi ; done ;`,
              continueOnFailure: true
            }
          );

          // Add the different Configuration file(s)
          beat.config.forEach((config, number) => {
            const fileNumber = (multipleFiles ? '__' + String(number + 1).padStart(3, '0') : '');

            // Adding file number, if any to the base file name. It is built using:
            // - configFileNameBase
            // - "__"
            // - Filenumber
            const configFileName = String(`${configFileNameBase}${fileNumber}`);

            steps.push(
              {
                action: `Create Stream configuration file (${configFileName}.json)`,
                command: `cat > ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`,
                stdin: (typeof config === 'string' ? config : JSON.stringify(config))
              },
              {
                action: `Set Stream configuration file the correct access rights (${configFileName}.json)`,
                command: `sudo chmod 640 ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`
              },
              {
                action: `Dump Stream configuration file (${configFileName}.json)`,
                command: `sudo cat ${tempSymbolicLinkPath}/config/inputs.d/${configFileName}.json`
              }
            );
          });

          // Wrap up
          steps.push(
            {
              action: 'List the Stream files of the config directory',
              command: `ls -la "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*`
            },
            {
              action: 'Delete the created Symbolic link to the installation folder of jsBeat',
              command: `rm -f "${tempSymbolicLinkPath}"`
            },
            {
              action: 'Restart jsBeat to take new configuration files into account',
              command: 'sudo systemctl restart jsbeat'
            }
          );
          pipelineImportForBeatStatus.payload.steps = steps;
        }

        // ##########
        // lrHttpRest
        // ##########
        if (beat.name.toLowerCase() === 'lrhttprest') {
          //
        }

        // Add the Steps to the Exec stack
        steps.forEach((step, stepCounter) => {
          // eslint-disable-next-line no-console
          // console.log(`importPipelineForBeat - Adding step: (${stepCounter}) ${step.action}...`);
          logToSystem('Debug', `importPipelineForBeat - Adding step: (${stepCounter}) ${step.action}...`);

          // Add space to record result ofthe action (return code, STDOUT, STDERR, ...)
          pipelineImportForBeatStatus.payload.steps[stepCounter].result = {
            errors: [],
            outputs: [],
            exitCode: undefined,
            failed: undefined
          }

          ssh
            .exec(step.command, {
              in: step.stdin || '',
              exit (code) {
                let continueToNextStep = true;
                logToSystem('Debug', `importPipelineForBeat - EXEC: (${code}) - ${step.command}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.exitCode = code;
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.failed = false;

                if (code !== 0) {
                  // if (socket.connected) {
                  //   socket.emit('shipper.install',
                  //     {
                  //       jobId: payload.jobId,
                  //       code: 'ERROR',
                  //       payload: 'STEP FAILED',
                  //       step: stepCounter + 1,
                  //       totalSteps: steps.length
                  //     });
                  //   socket.emit('shipper.install',
                  //     {
                  //       jobId: payload.jobId,
                  //       code: 'EXIT',
                  //       payload: `Return code: ${code}`,
                  //       step: stepCounter + 1,
                  //       totalSteps: steps.length
                  //     });
                  // }

                  pipelineImportForBeatStatus.errors.push(`Step ${stepCounter} failed with return code (${code}) - Command was: ${step.command}`);
                  pipelineImportForBeatStatus.payload.steps[stepCounter].result.failed = true;
                  continueToNextStep = false;
                  // Set the whole job as failed, except if we are meant to continueOnFailure for this step
                  pipelineImportForBeatStatus.payload.success = !!(false | step.continueOnFailure)
                } // if (code !== 0) {

                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'FINISHED',
                //       payload: step.action,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }

                // Check if need to force Continue
                if (step.continueOnFailure === true) {
                  continueToNextStep = true;
                }

                return continueToNextStep;
              },
              err (stderr) {
                // pipelineImportForBeatStatus.errors.push(stderr);
                logToSystem('Debug', `importPipelineForBeat - STDERR: ${stderr}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.errors.push(stderr);
                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'STDERR',
                //       payload: stderr,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }
              },
              out (stdout) {
                // pipelineImportForBeatStatus.outputs.push(stdout);
                logToSystem('Debug', `importPipelineForBeat - STDOUT: ${stdout}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.outputs.push(stdout);
                // if (socket.connected) {
                //   socket.emit('shipper.install',
                //     {
                //       jobId: payload.jobId,
                //       code: 'STDOUT',
                //       payload: stdout,
                //       step: stepCounter + 1,
                //       totalSteps: steps.length
                //     });
                // }
              }
            });
        });

        // Add Event handlers and start
        ssh
          .on('end', (err) => {
            logToSystem('Debug', `importPipelineForBeat - END: (${err})`);
            if (err) {
              pipelineImportForBeatStatus.error.push(err);
            } else {
              //  If Success is not already set to False, then set it to true
              if (pipelineImportForBeatStatus.payload.success !== false) {
                pipelineImportForBeatStatus.payload.success = true;
              }
            }
            pipelineImportForBeatStatus.stillUpdating = false;

            // Cleanup the sessions
            // // eslint-disable-next-line no-use-before-define
            // killInstallShipper(socket, payload);
            // if (socket.connected) {
            //   socket.emit('shipper.install',
            //     {
            //       jobId: payload.jobId,
            //       code: 'END',
            //       payload: err || 'SUCCESS',
            //       step: null,
            //       totalSteps: steps.length
            //     });
            // }
          })
          .start({
            failure () {
              pipelineImportForBeatStatus.error.push('FAILURE - Job could not start');
              pipelineImportForBeatStatus.stillUpdating = false;

              // // Cleanup the sessions
              // // eslint-disable-next-line no-use-before-define
              // killInstallShipper(socket, payload);
              // if (socket.connected) {
              //   socket.emit('shipper.install',
              //     {
              //       jobId: payload.jobId,
              //       code: 'FAILURE',
              //       payload: 'Job could not start',
              //       step: null,
              //       totalSteps: steps.length
              //     });
              // }
            }
          });

      } catch (errorCaught) {
        pipelineImportForBeatStatus.errors.push('Exception: ' + errorCaught.message);
      } finally {
        //
      }
    }).catch(() => {
      pipelineImportForBeatStatus.errors.push(`Failed to get SSH configuration for OpenCollector (based on provided UID: ${openCollector.uid}).`);
      pipelineImportForBeatStatus.stillUpdating = false;
    });
  } else {
    pipelineImportForBeatStatus.errors.push('[importPipelineForBeat] Missing parameter(s). See following errors.');
    if (missingOpenCollector) {
      pipelineImportForBeatStatus.errors.push('Missing or malformed "opencCollector" object.');
    }
    if (missingBeat) {
      pipelineImportForBeatStatus.errors.push('Missing or malformed "beat" object.');
    }
    if (missingStream) {
      pipelineImportForBeatStatus.errors.push('Missing or malformed "stream" object.');
    }
    pipelineImportForBeatStatus.stillUpdating = false;
  }
  /* eslint-enable no-param-reassign */
}

router.post('/ImportPipelineForBeat', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(req && req.body && req.body.openCollector && req.body.openCollector.uid && req.body.openCollector.uid.length)
  const missingBeat = !(req && req.body && req.body.beat && req.body.beat.name && req.body.beat.name.length && req.body.beat.config && Array.isArray(req.body.beat.config))
  const missingStream = !(req && req.body && req.body.stream && req.body.stream.uid && req.body.stream.uid.length)
  if (
    !missingOpenCollector &&
    !missingBeat &&
    !missingStream
  ) {
    const { openCollector, beat, stream } = req.body;

    if (!pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]) {
      // pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = Object.assign({}, pipelineImportForBeatStatusTemplate);
      pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = JSON.parse(JSON.stringify(pipelineImportForBeatStatusTemplate));
    }

    if (req.body.NoWait === undefined || (req.body.NoWait !== undefined && req.body.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating) {
        pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating = true;
        importPipelineForBeat(pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating
        && (pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].lastSuccessfulUpdateTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        importPipelineForBeat(pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
    }

    if (pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].payload) {
      // pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].payload.params = {
      //   openCollector,
      //   beat,
      //   stream
      // };
    }
    res.json(pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]);
  } else {
    const errorMessages = []; //['Missing parameters in Body (Both `openCollector`, `beat` and `stream` objects are compulstory and must be properly populated).. See following errors.']
    if (missingOpenCollector) {
      errorMessages.push('Missing or malformed compulstory "opencCollector" object.');
    }
    if (missingBeat) {
      errorMessages.push('Missing or malformed compulstory "beat" object.');
    }
    if (missingStream) {
      errorMessages.push('Missing or malformed compulstory "stream" object.');
    }


    res.json(Object.assign(Object.assign({}, pipelineImportForBeatStatusTemplate), { errors: errorMessages }, { requestBody: req.body }));
  }
});


module.exports = router;
