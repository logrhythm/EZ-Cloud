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
        const steps = [];

        // ##########
        // Filebeat
        // ##########
        if (beat.name.toLowerCase() === 'filebeat') {
          // Build the list of steps

          steps.push(
            {
              action: 'Create new Input folder to drop dynamic input files into, in case it\'s missing',
              command: 'if ! [ -d "/etc/filebeat/inputs.d" ]; then sudo mkdir -p /etc/filebeat/inputs.d ; fi;'
            }
          );

          // Add the different Configuration file(s)
          // Let's use file numbering only if there are more than one
          const multipleFiles = beat.config.length > 1

          beat.config.forEach((config, number) => {
            const fileNumber = (multipleFiles ? '__' + String(number + 1).padStart(3, '0') : '');

            // Config file name will be escaped (to only letters, numbers, dashes and underscores) to 
            // not cause issues on the file system. Any non autorised chars will be replaced by "_".
            // It is built using:
            // - Stream UID
            // - "__"
            // - Stream Name
            // - "__"
            // - Filenumber
            const configFileName = String(`${stream.uid}__${stream.name}${fileNumber}`).replace(/[^a-zA-Z0-9_-]/g, '_');

            steps.push(
              {
                action: `Delete and previous backup of the Stream configuration file (${configFileName}.bak)`,
                command: `if [ -f "/etc/filebeat/inputs.d/${configFileName}.bak" ]; then rm -f /etc/filebeat/inputs.d/${configFileName}.bak ; fi;`,
                continueOnFailure: true
              },
              {
                action: `Backup previous Stream configuration file (${configFileName}.yml)`,
                command: `if [ -f "/etc/filebeat/inputs.d/${configFileName}.yml" ]; then mv -f /etc/filebeat/inputs.d/${configFileName}.yml /etc/filebeat/inputs.d/${configFileName}.bak ; fi;`,
                continueOnFailure: true
              },
              {
                action: `Create Stream configuration file (${configFileName}.yml)`,
                command: `cat > /etc/filebeat/inputs.d/${configFileName}.yml`,
                stdin: (typeof config === String ? config : JSON.stringify(config))
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
              action: 'List the files of the config directory',
              command: 'ls -la /etc/filebeat/inputs.d/'
            }
          );
          streamUpdateForBeatStatus.payload.steps = steps;
        }

        // ##########
        // jsBeat
        // ##########
        if (beat.name.toLowerCase() === 'jsbeat') {
          //
        }

        // ##########
        // lrHttpRest
        // ##########
        if (beat.name.toLowerCase() === 'lrhttprest') {
          //
        }
      } catch (errorCaught) {
        streamUpdateForBeatStatus.errors.push('Exception: ' + errorCaught.message);
      } finally {
        //
      }

      // ####################################################################################################
      // ssh
      //   .exec('/opt/jsBeat/bin/start.sh --version | grep -i jsbeat 2>/dev/null', {
      //     err (stderr) {
      //       streamUpdateForBeatStatus.errors.push(stderr);
      //     },
      //     exit (code) {
      //       streamUpdateForBeatStatus.lastSuccessfulUpdateTimeStampUtc = Date.now() / 1000;
      //     },
      //     out (stdout) {
      //       const version = stdout.match(/js[Bb]eat *(([0-9]+)\.([0-9]+)\.([0-9]+))/);
      //       if (version.length > 0) {
      //         streamUpdateForBeatStatus.payload = {
      //           name: 'jsBeat',
      //           version: {
      //             detailed: { major: version[2], minor: version[3], build: version[4] },
      //             full: version[1]
      //           }
      //         };
      //       } else {
      //         streamUpdateForBeatStatus.payload = { name: 'jsBeat', version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };
      //       }
      //       streamUpdateForBeatStatus.outputs.push(stdout);
      //     }
      //   })
      //   .on('end', (err) => {
      //     streamUpdateForBeatStatus.stillUpdating = false;
      //   })
      //   .start({
      //     failure () {
      //       streamUpdateForBeatStatus.stillUpdating = false;
      //     }
      //   });
      streamUpdateForBeatStatus.stillUpdating = false; // XXXX
    }).catch(() => {
      streamUpdateForBeatStatus.errors.push('Failed to get SSH configuration for OpenCollector (based on provided UID).');
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


    res.json(Object.assign(Object.assign({}, streamUpdateForBeatStatusTemplate), { errors: errorMessages }));
  }
});


module.exports = router;
