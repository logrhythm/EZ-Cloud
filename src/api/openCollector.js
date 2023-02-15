const { exception } = require('console');
const express = require('express');

const router = express.Router();
// Get SSH config
const fs = require('fs');
const path = require('path');

// Create SSH object
const SSH = require('simple-ssh');

// Lib to get the SSH config for a given OpenCollector
const { getSshConfigForCollector } = require('../shared/collectorSshConfig');
const { lrObfuscateSecret } = require('../shared/crypto');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

// Load the Sanitisation function(s)
const { getSafeUidFrom } = require('../shared/sanitiser');

function waitMilliseconds(delay = 250) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

const maxCheckInterval = 60; // Check once every X seconds max, and/or timeout after X seconds

router.get('/', (req, res) => {
  res.json({
    message: 'API - Open Collector - All good'
  });
});

const responseTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // null (unchecked) or object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

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
            } catch (error) {
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
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

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
    res.json({ ...osVersionTemplate, errors: ['Missing UID in Query.'] });
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
            } catch (error) {
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
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

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
    res.json({ ...fbVersionTemplate, errors: ['Missing UID in Query.'] });
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
            } catch (error) {
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
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

    if (!ocAndBeatsVersionArray[uid]) {
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
    res.json({ ...ocAndBeatsVersionTemplate, errors: ['Missing UID in Query.'] });
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

function checkjsBeatVersion(jsBeatVersion, uid) {
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
          err(stderr) {
            jsBeatVersion.errors.push(stderr);
          },
          exit(code) {
            jsBeatVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
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
          failure() {
            jsBeatVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckJsBeatVersion', async (req, res) => {
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

    if (!jsBeatVersionArray[uid]) {
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
    res.json({ ...jsBeatVersionTemplate, errors: ['Missing UID in Query.'] });
  }
});

// #############################################
// CheckDockerPresence
// #############################################

const dockerPresence = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { presence: false }, // object with presence
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

function checkDockerPresence() {
  getSshConfigForCollector({ uid }).then((sshConfig) => {
    const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

    dockerPresence.stillChecking = true;
    dockerPresence.errors = [];
    dockerPresence.outputs = [];
    dockerPresence.payload = { presence: false };

    ssh
      .exec('docker -v >/dev/null 2>/dev/null || exit 1', {
        err(stderr) {
          dockerPresence.errors.push(stderr);
        },
        exit(code) {
          dockerPresence.payload.presence = (code !== 1);
          dockerPresence.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
        },
        out(stdout) {
          dockerPresence.outputs.push(stdout);
        }
      })
      .on('end', (err) => {
        dockerPresence.stillChecking = false;
      })
      .start({
        failure() {
          dockerPresence.stillChecking = false;
        }
      });
  });
}

router.get('/CheckDockerPresence', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!dockerPresence.stillChecking) {
      checkDockerPresence();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval;

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

const dockerVersionTemplate = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const dockerVersionArray = {};

function checkDockerVersion(dockerVersion, uid) {
  /* eslint-disable no-param-reassign */
  if (uid && uid.length) {
    getSshConfigForCollector({ uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      dockerVersion.stillChecking = true;
      dockerVersion.errors = [];
      dockerVersion.outputs = [];
      dockerVersion.payload = null;

      ssh
        .exec('docker -v 2>/dev/null || exit 1', {
          err(stderr) {
            dockerVersion.errors.push(stderr);
          },
          exit(code) {
            dockerVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          },
          out(stdout) {
            const version = stdout.match(/.*?\s+(([0-9]+)\.([0-9]+)\.([0-9]+))/);
            if (version && version.length > 4) {
              dockerVersion.payload = {
                version: {
                  detailed: {
                    major: version[2], minor: version[3], build: version[4]
                  },
                  full: version[1]
                }
              };
            } else {
              dockerVersion.payload = null;
            }
            dockerVersion.outputs.push(stdout);
          }
        })
        .on('end', (err) => {
          dockerVersion.stillChecking = false;
        })
        .start({
          failure() {
            dockerVersion.stillChecking = false;
          }
        });
    });
  }
  /* eslint-enable no-param-reassign */
}

router.get('/CheckDockerVersion', async (req, res) => {
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

    if (!dockerVersionArray[uid]) {
      dockerVersionArray[uid] = JSON.parse(JSON.stringify(dockerVersionTemplate));
    }

    if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!dockerVersionArray[uid].stillChecking) {
        dockerVersionArray[uid].stillChecking = true;
        checkDockerVersion(dockerVersionArray[uid], uid);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (dockerVersionArray[uid].stillChecking && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !dockerVersionArray[uid].stillChecking
        && (dockerVersionArray[uid].lastSuccessfulCheckTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        checkDockerVersion(dockerVersionArray[uid], uid);
      }
    }

    res.json(dockerVersionArray[uid]);
  } else {
    res.json({ ...dockerVersionTemplate, errors: ['Missing UID in Query.'] });
  }
});

// #############################################
// CheckOCPresence
// #############################################

const ocPresence = {
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
};

function checkOCPresence() {
  getSshConfigForCollector({ uid }).then((sshConfig) => {
    const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));
    ocPresence.stillChecking = true;
    ocPresence.errors = [];
    ocPresence.outputs = [];
    ocPresence.payload.presence = false;

    ssh
      .exec('ls lrctl >/dev/null 2>/dev/null || exit 1', {
        err(stderr) {
          ocPresence.errors.push(stderr);
        },
        exit(code) {
          ocPresence.lrtclPresent = (code !== 1);
          return ocPresence.lrtclPresent;
        },
        out(stdout) {
          ocPresence.outputs.push(stdout);
        }
      })
      .exec('./lrctl --help >/dev/null 2>/dev/null || exit 1', {
        err(stderr) {
          ocPresence.errors.push(stderr);
        },
        exit(code) {
          ocPresence.lrtclCanRun = (code !== 1);
          return ocPresence.lrtclCanRun;
        },
        out(stdout) {
          ocPresence.outputs.push(stdout);
        }
      })
      .exec('./lrctl status | grep -c -i open_collector 2>/dev/null || exit 1', {
        err(stderr) {
          ocPresence.errors.push(stderr);
        },
        exit(code) {
          ocPresence.ocPresent = (code !== 1);
          ocPresence.payload.presence = ocPresence.ocPresent;
          return ocPresence.ocPresent;
        },
        out(stdout) {
          ocPresence.outputs.push(stdout);
        }
      })
      .on('end', (err) => {
        ocPresence.stillChecking = false;
        ocPresence.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      })
      .start({
        failure() {
          ocPresence.stillChecking = false;
        }
      });
  });
}

router.get('/CheckOCPresence', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocPresence.stillChecking) {
      checkOCPresence();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval;
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
            } else {
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
  if (req
    && req.query
    && req.query.uid
    && req.query.uid.length
    && getSafeUidFrom(req.query).length
  ) {
    const uid = getSafeUidFrom(req.query);

    if (!ocVersionArray[uid]) {
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
    res.json({ ...ocVersionTemplate, errors: ['Missing UID in Query.'] });
  }
});

// #############################################
// CheckOCHealth
// #############################################

const ocHealth = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { health: '' }, // object with health
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

function checkOCHealth() {
  getSshConfigForCollector({ uid }).then((sshConfig) => {
    const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

    ocHealth.stillChecking = true;
    ocHealth.errors = [];
    ocHealth.outputs = [];
    ocHealth.payload = { health: '' };

    ssh
      .exec('./lrctl status 2>/dev/null | grep -i open_collector 2>/dev/null', {
        err(stderr) {
          ocHealth.errors.push(stderr);
        },
        exit(code) {
          ocHealth.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
        },
        out(stdout) {
          health = stdout.match(/open_collector *[0-9]+\.[0-9]+\.[0-9]+ *[0-9]+-[0-9]+-[0-9]+ +[0-9]+:[0-9]+:[0-9]+ +\+[0-9]+ +UTC +(\w*)/);
          if (health.length > 0) {
            ocHealth.payload = { health: health[1] };
          } else {
            ocHealth.payload = { health: '' };
          }
          ocHealth.outputs.push(stdout);
        }
      })
      .on('end', (err) => {
        ocHealth.stillChecking = false;
      })
      .start({
        failure() {
          ocHealth.stillChecking = false;
        }
      });
  });
}

router.get('/CheckOCHealth', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocHealth.stillChecking) {
      checkOCHealth();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval;

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

const ocConfiguration = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: '', // raw output
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

function readOcConfiguration() {
  getSshConfigForCollector({ uid }).then((sshConfig) => {
    const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

    ocConfiguration.stillChecking = true;
    ocConfiguration.errors = [];
    ocConfiguration.outputs = [];
    ocConfiguration.payload = '';

    ssh
      .exec('./lrctl open-collector config export 2>/dev/null', {
        err(stderr) {
          ocConfiguration.errors.push(stderr);
        },
        exit(code) {
          ocConfiguration.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
        },
        out(stdout) {
          ocConfiguration.payload = stdout;
          ocConfiguration.outputs.push(stdout);
        }
      })
      .on('end', (err) => {
        ocConfiguration.stillChecking = false;
      })
      .start({
        failure() {
          ocConfiguration.stillChecking = false;
        }
      });
  });
}

router.get('/ReadOcConfiguration', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocConfiguration.stillChecking) {
      readOcConfiguration();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval;

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

function updateStreamConfigurationForBeat(streamUpdateForBeatStatus, openCollector, beat, stream) {
  /* eslint-disable no-param-reassign */
  // Check we are ship-shape with the params
  const missingOpenCollector = !(
    openCollector
    && openCollector.uid
    && openCollector.uid.length
  );
  const missingBeat = !(
    beat
    && beat.name
    && beat.name.length
    && beat.config
    && Array.isArray(beat.config)
    && beat.sourceJsonConfig
  );
  const missingStream = !(
    stream
    && stream.uid
    && stream.uid.length
  );
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      streamUpdateForBeatStatus.stillUpdating = true;
      streamUpdateForBeatStatus.errors = [];
      streamUpdateForBeatStatus.outputs = [];
      streamUpdateForBeatStatus.payload = {};

      // ##########################################################################################

      try {
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

        // Identifier for the second part of the LogRhythm Beat's FQBN (Fully Qualified Beat Name)
        const logRhythmBeatIdentifier = String(`${stream.uid.substring(0, 3)}_${stream.name.replace(/[^a-zA-Z0-9]/g, '_')}_${stream.uid}`).substring(0, 12);
        // Fully Qualified Beat Name
        const logRhythmFullyQualifiedBeatName = String(
          `${
            beat.name.toLowerCase().trim()
          }_${
            logRhythmBeatIdentifier
          }`
        );

        // Let's use file numbering only if there are more than one configuration file provided
        const multipleFiles = beat.config.length > 1;

        // Load the base config file for LogRhythm shippers
        const logrhythmShipperBaseConfig = fs.readFileSync(path.join(process.env.baseDirname, 'resources', 'LogRhythm_shippers-base_config.yaml'));

        // Go through the config to spot Files to be dropped in, and drop them :)
        // A file object always has `dropIn`, `valueInConfig` and `fileContentBase64`
        // Value of `dropIn` must be true
        const dropInFiles = []; // To store any found Drop In files in the config
        if (beat && beat.sourceJsonConfig) {
          Object.keys(beat.sourceJsonConfig).forEach((configPath) => {
            if (
              beat.sourceJsonConfig[configPath]
              && beat.sourceJsonConfig[configPath].dropIn === true
              && beat.sourceJsonConfig[configPath].valueInConfig
              && beat.sourceJsonConfig[configPath].valueInConfig.length
              && beat.sourceJsonConfig[configPath].fileContentBase64 != null
            ) {
              dropInFiles.push(beat.sourceJsonConfig[configPath]);
            }
          });
        }

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
            const fileNumber = (multipleFiles ? `__${String(number + 1).padStart(3, '0')}` : '');

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
              command: `ls -la "/etc/filebeat/inputs.d/${configFileNameBase}"*`
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
            const fileNumber = (multipleFiles ? `__${String(number + 1).padStart(3, '0')}` : '');

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
        // LogRhythm Beats (genericbeat, webhookbeat, s3beat, ...)
        // ##########
        if (
          beat.name.toLowerCase() === 'genericbeat'
          || beat.name.toLowerCase() === 'webhookbeat'
          || beat.name.toLowerCase() === 's3beat'
          || beat.name.toLowerCase() === 'pubsubbeat'
          || beat.name.toLowerCase() === 'kafkabeat'
          || beat.name.toLowerCase() === 'eventhubbeat'
        ) {
          const beatNameLowerCase = beat.name.toLowerCase();

          // logrhythmShipperBaseConfig
          // Build the list of steps
          // Configuration volume name for Beat

          const beatConfigVolumeName = String(
            `${beatNameLowerCase
            }_config_${logRhythmBeatIdentifier}`
          );

          // Import the Configuration (should only be one, but deal with all of them)
          beat.config.forEach((config) => {
            // Push the config itself
            steps.push(
              {
                action: `Import Stream configuration for FQBN (${logRhythmFullyQualifiedBeatName})`,
                command: `cat | ./lrctl ${beatNameLowerCase} config import --fqbn ${logRhythmFullyQualifiedBeatName}`,
                stdin: (typeof config === 'string' ? `${config}\n${logrhythmShipperBaseConfig}` : `${JSON.stringify(config)}\n${logrhythmShipperBaseConfig}`)
              }
            );
          });

          // Drop the "Drop In" files, if any
          if (dropInFiles && Array.isArray(dropInFiles) && dropInFiles.length) {
            // Some files must be dropped in the Beat's config volume

            // Create a unique ID for the Helper/Utility Container
            const utilityContainerId = `cp-helper_oc-admin_${Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0')}`;
            // Create a temporary file name, based on the Helper/Utility Container name
            const tempFilePath = String(`/tmp/${utilityContainerId}`)
              .replaceAll('//', '/')
              .replaceAll('"', '');

            steps.push(
              { // Import configuration
                action: `Create utility container ("${utilityContainerId}")`,
                command: `docker container create --name "${utilityContainerId}" -v "${beatConfigVolumeName}:/cp_target" alpine 1>/dev/null`
              }
            );

            // Loop through them and add the right tasks to deal with each of them
            dropInFiles.forEach((fileToDrop) => {
              //   "certFilePath":{
              //     "dropIn":true,
              //     "valueInConfig":"/beats/webhookbeat/config/webhookbeat.crt",
              //     "dropInPath":"{{beat_config_volume}}/webhookbeat.crt",
              //     "fileContentBase64":"LS0tLSBCRUdJTiBTU0gyIF.....IFBVQkxJQyBLRVkgLS0tLQ==",
              //     "fileSizeBytes":442
              //   },
              const copyTargetPath = String(`/cp_target/${fileToDrop.dropInPath}`)
                .replaceAll('//', '/')
                .replaceAll('"', '');
              // fileToDrop.fileContentBase64 is Base64 encoded.
              const fileContentBinary = Buffer.from(fileToDrop.fileContentBase64, 'base64').toString('latin1');

              // Import File
              steps.push(
                {
                  action: `Drop file content into temporary file: "${tempFilePath}" (${fileToDrop.fileSizeBytes} bytes)`,
                  command: `cat > ${tempFilePath}`,
                  stdin: fileContentBinary
                },
                {
                  action: `Importing file referrenced in Beat's configuration as: "${fileToDrop.valueInConfig}"`,
                  command: `docker cp "${tempFilePath}" "${utilityContainerId}:${copyTargetPath}" 1>/dev/null`
                }
              );
            });

            // Clean up
            steps.push(
              {
                action: `Remove temporary file: "${tempFilePath}"`,
                command: `rm -f "${tempFilePath}" 1>/dev/null`
              },
              {
                action: `Remove utility container ("${utilityContainerId}")`,
                command: `docker container rm "${utilityContainerId}" 1>/dev/null`
              }
            );
          }

          // Wrap up
          steps.push(
            // We do a Stop - Start as a Restart would not do anything on a Beat not already running
            {
              action: `Stop ${beat.name}`,
              command: `./lrctl ${beatNameLowerCase} stop --fqbn ${logRhythmFullyQualifiedBeatName}`
            },
            {
              action: `Start ${beat.name} to take new configuration into account`,
              command: `./lrctl ${beatNameLowerCase} start --fqbn ${logRhythmFullyQualifiedBeatName}`
            },
            {
              action: `Check Status for all ${beat.name} instances`,
              command: `./lrctl ${beatNameLowerCase} status`
            },
            {
              action: `Get ${beat.name} logs for this instance (last 10 lines only)`,
              command: `docker logs --tail 10 "${logRhythmFullyQualifiedBeatName}"`
            }
          );
          streamUpdateForBeatStatus.payload.steps = steps;
        }

        // Add the Steps to the Exec stack
        steps.forEach((step, stepCounter) => {
          logToSystem('Debug', `updateStreamConfigurationForBeat - Adding step: (${stepCounter}) ${step.action}...`);

          // Add space to record result ofthe action (return code, STDOUT, STDERR, ...)
          streamUpdateForBeatStatus.payload.steps[stepCounter].result = {
            errors: [],
            outputs: [],
            exitCode: undefined,
            failed: undefined
          };

          ssh
            .exec(step.command, {
              in: step.stdin || '',
              exit(code) {
                let continueToNextStep = true;
                logToSystem('Debug', `updateStreamConfigurationForBeat - EXEC: (${code}) - ${step.command}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.exitCode = code;
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.failed = false;

                if (code !== 0) {
                  streamUpdateForBeatStatus.errors.push(`Step ${stepCounter} failed with return code (${code}) - Command was: ${step.command}`);
                  streamUpdateForBeatStatus.payload.steps[stepCounter].result.failed = true;
                  continueToNextStep = false;
                  // Set the whole job as failed, except if we are meant to continueOnFailure for this step
                  streamUpdateForBeatStatus.payload.success = !!(false | step.continueOnFailure);
                } // if (code !== 0) {

                // Check if need to force Continue
                if (step.continueOnFailure === true) {
                  continueToNextStep = true;
                }

                return continueToNextStep;
              },
              err(stderr) {
                logToSystem('Debug', `updateStreamConfigurationForBeat - STDERR: ${stderr}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.errors.push(stderr);
              },
              out(stdout) {
                logToSystem('Debug', `updateStreamConfigurationForBeat - STDOUT: ${stdout}`);
                streamUpdateForBeatStatus.payload.steps[stepCounter].result.outputs.push(stdout);
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
          })
          .start({
            failure() {
              streamUpdateForBeatStatus.error.push('FAILURE - Job could not start');
              streamUpdateForBeatStatus.stillUpdating = false;
            }
          });
      } catch (errorCaught) {
        streamUpdateForBeatStatus.errors.push(`Exception: ${errorCaught.message}`);
        streamUpdateForBeatStatus.stillUpdating = false;
      }
    }).catch(() => {
      streamUpdateForBeatStatus.errors.push(`Failed to get SSH configuration for OpenCollector (based on provided UID: ${openCollector.uid}).`);
      streamUpdateForBeatStatus.stillUpdating = false;
    });
  } else {
    streamUpdateForBeatStatus.errors.push('[updateStreamConfigurationForBeat] Missing parameter(s). See following errors.');
    if (missingOpenCollector) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "openCollector" object.');
    }
    if (missingBeat) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "beat" object.');
    }
    if (missingStream) {
      streamUpdateForBeatStatus.errors.push('Missing or malformed "stream" object.');
    }
    streamUpdateForBeatStatus.stillUpdating = false;
  }
  logToSystem('Debug', `updateStreamConfigurationForBeat - Errors for API: ${JSON.stringify(streamUpdateForBeatStatus.errors, null, ' ')}`);
  /* eslint-enable no-param-reassign */
}

router.post('/UpdateStreamConfigurationForBeat', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(
    req
    && req.body
    && req.body.openCollector
    && req.body.openCollector.uid
    && req.body.openCollector.uid.length
  );
  const missingBeat = !(
    req
    && req.body
    && req.body.beat
    && req.body.beat.name
    && req.body.beat.name.length
    && req.body.beat.config
    && Array.isArray(req.body.beat.config)
  );
  const missingStream = !(
    req
    && req.body
    && req.body.stream
    && req.body.stream.uid
    && req.body.stream.uid.length
  );
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    const { openCollector, beat, stream } = req.body;

    if (!streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]) {
      streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = JSON.parse(JSON.stringify(streamUpdateForBeatStatusTemplate));
    }

    if (req.body.NoWait === undefined || (req.body.NoWait !== undefined && req.body.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating) {
        streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating = true;
        updateStreamConfigurationForBeat(streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }

      // Exceptionnaly, increase the timeout for this opeation (to 5 times the standard one)
      const loopEndTime = Date.now() / 1000 + maxCheckInterval * 5;

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

    res.json(streamUpdateForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]);
  } else {
    const errorMessages = [];
    if (missingOpenCollector) {
      errorMessages.push('Missing or malformed compulsory "openCollector" object.');
    }
    if (missingBeat) {
      errorMessages.push('Missing or malformed compulsory "beat" object.');
    }
    if (missingStream) {
      errorMessages.push('Missing or malformed compulsory "stream" object.');
    }

    res.json({ ...streamUpdateForBeatStatusTemplate, errors: errorMessages, requestBody: (process.env.NODE_ENV === 'development' ? req.body : undefined) });
  }
});

// #############################################
// DeleteStreamConfigurationForBeat
// #############################################

const streamConfigDeleteForBeatStatusTemplate = {
  stillUpdating: false,
  lastSuccessfulUpdateTimeStampUtc: 0,
  payload: {}, // object with result of the operation
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const streamConfigDeleteForBeatStatusArray = {};

function deleteStreamConfigurationForBeat(
  streamConfigDeleteForBeatStatus,
  openCollector,
  beat,
  stream
) {
  /* eslint-disable no-param-reassign */
  // Check we are ship-shape with the params
  const missingOpenCollector = !(openCollector && openCollector.uid && openCollector.uid.length);
  const missingBeat = !(beat && beat.name && beat.name.length);
  const missingStream = !(stream && stream.uid && stream.uid.length);
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      streamConfigDeleteForBeatStatus.stillUpdating = true;
      streamConfigDeleteForBeatStatus.errors = [];
      streamConfigDeleteForBeatStatus.outputs = [];
      streamConfigDeleteForBeatStatus.payload = {};

      try {
        // Initialise the empty list of Steps
        const steps = [];

        // Config file name will be escaped (to only letters, numbers, dashes and underscores) to
        // not cause issues on the file system. Any non autorised chars will be replaced by "_".
        // It is built using:
        // - Stream Name
        // - "__"
        // - Stream UID
        const configFileNameBase = String(`${stream.name}__${stream.uid}`).replace(/[^a-zA-Z0-9_-]/g, '_');

        // Identifier for the second part of the LogRhythm Beat's FQBN (Fully Qualified Beat Name)
        const logRhythmBeatIdentifier = String(`${stream.uid.substring(0, 3)}_${stream.name.replace(/[^a-zA-Z0-9]/g, '_')}_${stream.uid}`).substring(0, 12);
        // Fully Qualified Beat Name
        const logRhythmFullyQualifiedBeatName = String(
          `${beat.name.toLowerCase().trim()
          }_${logRhythmBeatIdentifier
          }`
        );

        // To avoid any risk of deleting unrelated files, we bail if the configFileNameBase is empty
        if (configFileNameBase.length === 0) {
          throw new Error('configFileNameBase too short (Stream Name and UID must be non-empty)');
        }

        // ##########
        // Filebeat
        // ##########
        if (beat.name.toLowerCase() === 'filebeat') {
          // Build the list of steps

          steps.push(
            {
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.yml -> *.bak)`,
              command: `for f in "/etc/filebeat/inputs.d/${configFileNameBase}"*.yml; do if [ -f "$f" ]; then mv -- "$f" "\${f%.yml}.bak" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: 'List the Stream files of the config directory',
              command: 'ls -la "/etc/filebeat/inputs.d/${configFileNameBase}"*',
              continueOnFailure: true
            }
          );

          streamConfigDeleteForBeatStatus.payload.steps = steps;
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
              action: `Delete any previous backups of the Stream configuration files (${configFileNameBase}*.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.bak; do if [ -f "$f" ]; then rm -f "$f" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: `Backup any previous Stream configuration files (${configFileNameBase}*.json -> *.bak)`,
              command: `for f in "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*.json; do if [ -f "$f" ]; then mv -- "$f" "\${f%.json}.bak" ; fi ; done ;`,
              continueOnFailure: true
            },
            {
              action: 'List the Stream files of the config directory',
              command: `ls -la "${tempSymbolicLinkPath}/config/inputs.d/${configFileNameBase}"*`,
              continueOnFailure: true
            },
            {
              action: 'Delete the created Symbolic link to the installation folder of jsBeat',
              command: `rm -f "${tempSymbolicLinkPath}"`,
              continueOnFailure: true
            },
            {
              action: 'Restart jsBeat to take new configuration files into account',
              command: 'sudo systemctl restart jsbeat'
            }
          );
          streamConfigDeleteForBeatStatus.payload.steps = steps;
        }

        // ##########
        // LogRhythm Beats (genericbeat, webhookbeat, s3beat)
        // ##########
        if (
          beat.name.toLowerCase() === 'genericbeat'
          || beat.name.toLowerCase() === 'webhookbeat'
          || beat.name.toLowerCase() === 's3beat'
        ) {
          const beatNameLowerCase = beat.name.toLowerCase();

          steps.push(
            {
              action: `Stop ${beat.name} instance (${logRhythmFullyQualifiedBeatName})`,
              command: `./lrctl ${beatNameLowerCase} stop --fqbn ${logRhythmFullyQualifiedBeatName}`,
              continueOnFailure: true
            },
            {
              action: `Remove configuration for this ${beat.name} instance (${logRhythmFullyQualifiedBeatName})`,
              command: `./lrctl ${beatNameLowerCase} config remove --yes --fqbn ${logRhythmFullyQualifiedBeatName}`
            },
            {
              action: `Check Status for all ${beat.name} instances`,
              command: `./lrctl ${beatNameLowerCase} status`
            }
          );
          streamConfigDeleteForBeatStatus.payload.steps = steps;
        }

        // Add the Steps to the Exec stack
        steps.forEach((step, stepCounter) => {
          logToSystem('Debug', `deleteStreamConfigurationForBeat - Adding step: (${stepCounter}) ${step.action}...`);

          // Add space to record result of the action (return code, STDOUT, STDERR, ...)
          streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result = {
            errors: [],
            outputs: [],
            exitCode: undefined,
            failed: undefined
          };

          ssh
            .exec(step.command, {
              in: step.stdin || '',
              exit(code) {
                let continueToNextStep = true;
                logToSystem('Debug', `deleteStreamConfigurationForBeat - EXEC: (${code}) - ${step.command}`);
                streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result.exitCode = code;
                streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result.failed = false;

                if (code !== 0) {
                  streamConfigDeleteForBeatStatus.errors.push(`Step ${stepCounter} failed with return code (${code}) - Command was: ${step.command}`);
                  streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result.failed = true;
                  continueToNextStep = false;
                  // Set the whole job as failed, except if we are meant to continueOnFailure for this step
                  streamConfigDeleteForBeatStatus.payload.success = !!(false | step.continueOnFailure);
                } // if (code !== 0) {

                // Check if need to force Continue
                if (step.continueOnFailure === true) {
                  continueToNextStep = true;
                }

                return continueToNextStep;
              },
              err(stderr) {
                logToSystem('Debug', `deleteStreamConfigurationForBeat - STDERR: ${stderr}`);
                streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result.errors.push(stderr);
              },
              out(stdout) {
                logToSystem('Debug', `deleteStreamConfigurationForBeat - STDOUT: ${stdout}`);
                streamConfigDeleteForBeatStatus.payload.steps[stepCounter].result.outputs.push(stdout);
              }
            });
        });

        // Add Event handlers and start
        ssh
          .on('end', (err) => {
            logToSystem('Debug', `deleteStreamConfigurationForBeat - END: (${err})`);
            if (err) {
              streamConfigDeleteForBeatStatus.error.push(err);
            } else {
              //  If Success is not already set to False, then set it to true
              if (streamConfigDeleteForBeatStatus.payload.success !== false) {
                streamConfigDeleteForBeatStatus.payload.success = true;
              }
            }
            streamConfigDeleteForBeatStatus.stillUpdating = false;
          })
          .start({
            failure() {
              streamConfigDeleteForBeatStatus.error.push('FAILURE - Job could not start');
              streamConfigDeleteForBeatStatus.stillUpdating = false;
            }
          });
      } catch (errorCaught) {
        streamConfigDeleteForBeatStatus.errors.push(`Exception: ${errorCaught.message}`);
      }
    }).catch(() => {
      streamConfigDeleteForBeatStatus.errors.push(`Failed to get SSH configuration for OpenCollector (based on provided UID: ${openCollector.uid}).`);
      streamConfigDeleteForBeatStatus.stillUpdating = false;
    });
  } else {
    streamConfigDeleteForBeatStatus.errors.push('[deleteStreamConfigurationForBeat] Missing parameter(s). See following errors.');
    if (missingOpenCollector) {
      streamConfigDeleteForBeatStatus.errors.push('Missing or malformed "openCollector" object.');
    }
    if (missingBeat) {
      streamConfigDeleteForBeatStatus.errors.push('Missing or malformed "beat" object.');
    }
    if (missingStream) {
      streamConfigDeleteForBeatStatus.errors.push('Missing or malformed "stream" object.');
    }
    streamConfigDeleteForBeatStatus.stillUpdating = false;
  }
  /* eslint-enable no-param-reassign */
}

router.post('/DeleteStreamConfigurationForBeat', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(req && req.body && req.body.openCollector && req.body.openCollector.uid && req.body.openCollector.uid.length);
  const missingBeat = !(req && req.body && req.body.beat && req.body.beat.name && req.body.beat.name.length);
  const missingStream = !(req && req.body && req.body.stream && req.body.stream.uid && req.body.stream.uid.length);
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    const { openCollector, beat, stream } = req.body;

    if (!streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]) {
      streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`] = JSON.parse(JSON.stringify(streamConfigDeleteForBeatStatusTemplate));
    }

    if (req.body.NoWait === undefined || (req.body.NoWait !== undefined && req.body.NoWait.toLowerCase() !== 'true')) {
      // Waiting - Sync
      if (!streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating) {
        streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating = true;
        deleteStreamConfigurationForBeat(streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
      const loopEndTime = Date.now() / 1000 + maxCheckInterval;

      while (streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating && (loopEndTime > (Date.now() / 1000))) {
        // Wait for 50 ms
        // eslint-disable-next-line no-await-in-loop
        await waitMilliseconds(50);
      }
    } else {
      // No waiting - Async
      // eslint-disable-next-line no-lonely-if
      if (
        !streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].stillUpdating
        && (streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`].lastSuccessfulUpdateTimeStampUtc + maxCheckInterval)
        <= (Date.now() / 1000)
      ) {
        deleteStreamConfigurationForBeat(streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`], openCollector, beat, stream);
      }
    }

    res.json(streamConfigDeleteForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]);
  } else {
    const errorMessages = [];
    if (missingOpenCollector) {
      errorMessages.push('Missing or malformed compulsory "openCollector" object.');
    }
    if (missingBeat) {
      errorMessages.push('Missing or malformed compulsory "beat" object.');
    }
    if (missingStream) {
      errorMessages.push('Missing or malformed compulsory "stream" object.');
    }

    res.json({ ...streamConfigDeleteForBeatStatusTemplate, errors: errorMessages, requestBody: (process.env.NODE_ENV === 'development' ? req.body : undefined) });
  }
});

// #############################################
// ImportPipelineForBeat
// #############################################

const pipelineImportForBeatStatusTemplate = {
  stillUpdating: false,
  lastSuccessfulUpdateTimeStampUtc: 0,
  payload: {}, // object with result of the operation
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

const pipelineImportForBeatStatusArray = {};

function importPipelineForBeat(pipelineImportForBeatStatus, openCollector, beat, stream) {
  /* eslint-disable no-param-reassign */
  // Check we are ship-shape with the params
  const missingOpenCollector = !(openCollector && openCollector.uid && openCollector.uid.length);
  const missingBeat = !(beat && beat.name && beat.name.length);
  const missingStream = !(
    stream
    && stream.uid && stream.uid.length
    && stream.name && stream.name.length
    && stream.sanitisedName && stream.sanitisedName.length
    && stream.jqFilter && stream.jqFilter.length
    && stream.jqTransform && stream.jqTransform.length
  );
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));

      pipelineImportForBeatStatus.stillUpdating = true;
      pipelineImportForBeatStatus.errors = [];
      pipelineImportForBeatStatus.outputs = [];
      pipelineImportForBeatStatus.payload = {};

      try {
        // Initialise the empty list of Steps
        const steps = [];

        // Pipeline file name will be escaped (to only letters, numbers, dashes and underscores) to
        // not cause issues on the file system. Any non autorised chars will be replaced by "_".
        // It is built using:
        // - Beat Name
        // - "__"
        // - Sanitised Stream Name
        const pipelineNameBase = String(`${beat.name}--${stream.sanitisedName}`).replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeSanitisedStreamName = stream.sanitisedName.replace(/[^a-zA-Z0-9_]/g, '_');

        // To avoid any risk of deleting unrelated files, we bail if the pipelineNameBase is empty
        if (pipelineNameBase.length === 0) {
          throw new Error('pipelineNameBase too short (Beat and Sanitised Stream Name must be non-empty)');
        }

        // Load the Pipeline template file
        const pipelineTemplateFile = fs.readFileSync(path.join(process.env.baseDirname, 'resources', 'EZ_stream_placeholder-template.pipe'));

        // Build a unique path to use as a temporary space to build the Pipeline file
        const cleanTimestamp = new Date().toISOString().replace(/[^a-zA-Z0-9_-]/g, '_');
        const tempWorkingDirectoryPath = `/tmp/ez-pipeline-build.${pipelineNameBase}__${cleanTimestamp}`;

        // Build the list of steps

        steps.push(
          {
            action: 'Clean up directories left by any previous attemp',
            command: `if [ -d "${tempWorkingDirectoryPath}" ]; then rm -rf ${tempWorkingDirectoryPath}; fi;`
          },
          {
            action: 'Create fresh temporary folder to download installer into',
            command: `mkdir ${tempWorkingDirectoryPath}`
          },
          {
            action: 'Extract the Pipeline template',
            command: `tar xvfz - --directory="${tempWorkingDirectoryPath}"`,
            stdin: pipelineTemplateFile
          },
          {
            action: 'Import Stream JQ Filter into Pipeline',
            command: `cat > "${tempWorkingDirectoryPath}/EZ_stream_placeholder/is_${safeSanitisedStreamName}.jq"`,
            stdin: stream.jqFilter
          },
          {
            action: 'Import Stream JQ Transform into Pipeline',
            command: `cat > "${tempWorkingDirectoryPath}/EZ_stream_placeholder/${safeSanitisedStreamName}.jq"`,
            stdin: stream.jqTransform
          },
          {
            action: 'Update files from template with the Stream name',
            command: `sed --in-place 's/EZ_stream_placeholder/${safeSanitisedStreamName}/g' "${tempWorkingDirectoryPath}/EZ_stream_placeholder/include.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/ocpipeline.root" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/EZ_stream_placeholder.yml" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/testdata/general.json" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/testdata/EZ_stream_placeholder.json" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/EZ_stream_placeholder_test.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/log_type_test.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/is_EZ_stream_placeholder_test.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/transform.jq"`
          },
          {
            action: `Rename files from template to match the Stream name (${safeSanitisedStreamName}.yml)`,
            command: `mv "${tempWorkingDirectoryPath}/EZ_stream_placeholder/EZ_stream_placeholder.yml" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/${safeSanitisedStreamName}.yml"`
          },
          {
            action: `Rename files from template to match the Stream name (tests/${safeSanitisedStreamName}_test.jq)`,
            command: `mv "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/EZ_stream_placeholder_test.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/${safeSanitisedStreamName}_test.jq"`
          },
          {
            action: `Rename files from template to match the Stream name (tests/is_${safeSanitisedStreamName}_test.jq)`,
            command: `mv "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/is_EZ_stream_placeholder_test.jq" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/is_${safeSanitisedStreamName}_test.jq"`
          },
          {
            action: `Rename files from template to match the Stream name (tests/testdata/${safeSanitisedStreamName}.json)`,
            command: `mv "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/testdata/EZ_stream_placeholder.json" "${tempWorkingDirectoryPath}/EZ_stream_placeholder/tests/testdata/${safeSanitisedStreamName}.json"`
          },
          {
            action: 'Rename directory to match the Stream name',
            command: `mv "${tempWorkingDirectoryPath}/EZ_stream_placeholder" "${tempWorkingDirectoryPath}/${safeSanitisedStreamName}"`
          },
          {
            action: 'Package the new Pipeline',
            command: `find "${tempWorkingDirectoryPath}/${safeSanitisedStreamName}/"* -type f | sed 's~${tempWorkingDirectoryPath}/~~' | tar cvzf "${tempWorkingDirectoryPath}/${safeSanitisedStreamName}.tgz" --directory="${tempWorkingDirectoryPath}/" --files-from=/dev/stdin --owner=0 --group=0 --mode='666'`
          },
          {
            action: 'Test newly packaged Pipeline',
            command: `tar tvfz "${tempWorkingDirectoryPath}/${safeSanitisedStreamName}.tgz"`
          },
          {
            action: 'Import newly packaged Pipeline into Open Collector',
            command: `cat "${tempWorkingDirectoryPath}/${safeSanitisedStreamName}.tgz" | ./lrctl oc pipe import`
          },
          {
            action: 'Delete the temporary work directory',
            command: `rm -rf "${tempWorkingDirectoryPath}"`
          },
          {
            action: 'Restart Open Collector',
            command: './lrctl oc restart'
          }
        );

        // Drop a copy of the steps in the Payload.steps of the response
        pipelineImportForBeatStatus.payload.steps = steps;

        // Add the Steps to the Exec stack
        steps.forEach((step, stepCounter) => {
          logToSystem('Debug', `importPipelineForBeat - Adding step: (${stepCounter}) ${step.action}...`);

          // Add space to record result of the action (return code, STDOUT, STDERR, ...)
          pipelineImportForBeatStatus.payload.steps[stepCounter].result = {
            errors: [],
            outputs: [],
            exitCode: undefined,
            failed: undefined
          };

          ssh
            .exec(step.command, {
              in: step.stdin || '',
              exit(code) {
                let continueToNextStep = true;
                logToSystem('Debug', `importPipelineForBeat - EXEC: (${code}) - ${step.command}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.exitCode = code;
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.failed = false;

                if (code !== 0) {
                  pipelineImportForBeatStatus.errors.push(`Step ${stepCounter} failed with return code (${code}) - Command was: ${step.command}`);
                  pipelineImportForBeatStatus.payload.steps[stepCounter].result.failed = true;
                  continueToNextStep = false;
                  // Set the whole job as failed, except if we are meant to continueOnFailure for this step
                  pipelineImportForBeatStatus.payload.success = !!(false | step.continueOnFailure);
                } // if (code !== 0) {

                // Check if need to force Continue
                if (step.continueOnFailure === true) {
                  continueToNextStep = true;
                }

                return continueToNextStep;
              },
              err(stderr) {
                // pipelineImportForBeatStatus.errors.push(stderr);
                logToSystem('Debug', `importPipelineForBeat - STDERR: ${stderr}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.errors.push(stderr);
              },
              out(stdout) {
                // pipelineImportForBeatStatus.outputs.push(stdout);
                logToSystem('Debug', `importPipelineForBeat - STDOUT: ${stdout}`);
                pipelineImportForBeatStatus.payload.steps[stepCounter].result.outputs.push(stdout);
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
          })
          .start({
            failure() {
              pipelineImportForBeatStatus.error.push('FAILURE - Job could not start');
              pipelineImportForBeatStatus.stillUpdating = false;
            }
          });
      } catch (errorCaught) {
        pipelineImportForBeatStatus.errors.push(`Exception: ${errorCaught.message}`);
      }
    }).catch(() => {
      pipelineImportForBeatStatus.errors.push(`Failed to get SSH configuration for OpenCollector (based on provided UID: ${openCollector.uid}).`);
      pipelineImportForBeatStatus.stillUpdating = false;
    });
  } else {
    pipelineImportForBeatStatus.errors.push('[importPipelineForBeat] Missing parameter(s). See following errors.');
    if (missingOpenCollector) {
      pipelineImportForBeatStatus.errors.push('Missing or malformed "openCollector" object.');
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
  const missingOpenCollector = !(req && req.body && req.body.openCollector && req.body.openCollector.uid && req.body.openCollector.uid.length);
  const missingBeat = !(req && req.body && req.body.beat && req.body.beat.name && req.body.beat.name.length);
  const missingStream = !(
    req && req.body
    && req.body.stream
    && req.body.stream.uid && req.body.stream.uid.length
    && req.body.stream.name && req.body.stream.name.length
    && req.body.stream.sanitisedName && req.body.stream.sanitisedName.length
    && req.body.stream.jqFilter && req.body.stream.jqFilter.length
    && req.body.stream.jqTransform && req.body.stream.jqTransform.length
  );
  if (
    !missingOpenCollector
    && !missingBeat
    && !missingStream
  ) {
    const { openCollector, beat, stream } = req.body;

    if (!pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]) {
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

    res.json(pipelineImportForBeatStatusArray[`${openCollector.uid}_${stream.uid}`]);
  } else {
    const errorMessages = []; // ['Missing parameters in Body (Both `openCollector`, `beat` and `stream` objects are compulsory and must be properly populated).. See following errors.']
    if (missingOpenCollector) {
      errorMessages.push('Missing or malformed compulsory "openCollector" object.');
    }
    if (missingBeat) {
      errorMessages.push('Missing or malformed compulsory "beat" object.');
    }
    if (missingStream) {
      errorMessages.push('Missing or malformed compulsory "stream" object.');
    }

    res.json({ ...pipelineImportForBeatStatusTemplate, errors: errorMessages, requestBody: (process.env.NODE_ENV === 'development' ? req.body : undefined) });
  }
});

// // #############################################
// // StartContainer
// // #############################################

// router.post('/StartContainer', async (req, res) => {
//   if (req
//     && req.query
//     && req.query.uid
//     && req.query.uid.length
//     && getSafeUidFrom(req.query).length
//   ) {
//     const uid = getSafeUidFrom(req.query);

//     if (uid && uid.length) {
//       getSshConfigForCollector({ uid }).then((sshConfig) => {
//         const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));
//         const responseObject = JSON.parse(JSON.stringify(responseTemplate));

//         ssh
//           .exec('docker -v 2>1', {
//             err(stderr) {
//               responseObject.errors.push(stderr);
//             },
//             out(stdout) {
//               try {
//                 responseObject.payload = JSON.parse(stdout);
//               } catch (error) {
//                 responseObject.payload = null;
//               }

//               responseObject.outputs.push(stdout);
//             },
//             exit(code) {
//               responseObject.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
//             }
//           })
//           .on('end', (err) => {
//             res.json(responseObject);
//           })
//           .start({
//             failure() {
//               res.json(responseObject);
//             }
//           });
//       });
//     }
//   } else {
//     res.json({ ...responseTemplate, errors: ['Missing UID in Query.'] });
//   }
// });

// #############################################
// StartContainer
// #############################################

router.post('/StartContainer', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(
    req
    && req.body
    && req.body.openCollector
    && req.body.openCollector.uid
    && req.body.openCollector.uid.length
  );
  const missingContainer = !(
    req
    && req.body
    && req.body.container
    && req.body.container.uid
    && req.body.container.uid.length
  );

  if (
    !missingOpenCollector
    && !missingContainer
  ) {
    const { openCollector, container } = req.body;

    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));
      const responseObject = { ...JSON.parse(JSON.stringify(responseTemplate)), payload: [] };

      ssh
        .exec(`docker start "${container.uid}"`, {
          err(stderr) {
            responseObject.errors.push(stderr);
          },
          out(stdout) {
            try {
              responseObject.payload = JSON.parse(stdout);
            } catch (error) {
              responseObject.payload = [];
            }

            responseObject.outputs.push(stdout);
          },
          exit(code) {
            responseObject.exitCode = code;
            responseObject.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          }
        })
        .on('end', (err) => {
          if (err != null) {
            responseObject.errors.push(err);
          }
          res.json(responseObject);
        })
        .start({
          failure() {
            responseObject.errors.push('Failed to start container');
            res.json(responseObject);
          }
        });
    });
  } else {
    const errors = ['[StartContainer] Missing parameter(s). See following errors.'];
    if (missingOpenCollector) {
      errors.push('Missing or malformed "openCollector" object.');
    }
    if (missingContainer) {
      errors.push('Missing or malformed "container" object.');
    }
    res.json({ ...responseTemplate, errors });
  }
});

// #############################################
// StopContainer
// #############################################

router.post('/StopContainer', async (req, res) => {
  // Check we are ship-shape with the params
  const missingOpenCollector = !(
    req
    && req.body
    && req.body.openCollector
    && req.body.openCollector.uid
    && req.body.openCollector.uid.length
  );
  const missingContainer = !(
    req
    && req.body
    && req.body.container
    && req.body.container.uid
    && req.body.container.uid.length
  );

  if (
    !missingOpenCollector
    && !missingContainer
  ) {
    const { openCollector, container } = req.body;

    getSshConfigForCollector({ uid: openCollector.uid }).then((sshConfig) => {
      const ssh = new SSH(JSON.parse(JSON.stringify(sshConfig)));
      const responseObject = { ...JSON.parse(JSON.stringify(responseTemplate)), payload: [] };

      ssh
        .exec(`docker stop "${container.uid}"`, {
          err(stderr) {
            responseObject.errors.push(stderr);
          },
          out(stdout) {
            try {
              responseObject.payload = JSON.parse(stdout);
            } catch (error) {
              responseObject.payload = [];
            }

            responseObject.outputs.push(stdout);
          },
          exit(code) {
            responseObject.exitCode = code;
            responseObject.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
          }
        })
        .on('end', (err) => {
          if (err != null) {
            responseObject.errors.push(err);
          }
          res.json(responseObject);
        })
        .start({
          failure() {
            responseObject.errors.push('Failed to stop container');
            res.json(responseObject);
          }
        });
    });
  } else {
    const errors = ['[StopContainer] Missing parameter(s). See following errors.'];
    if (missingOpenCollector) {
      errors.push('Missing or malformed "openCollector" object.');
    }
    if (missingContainer) {
      errors.push('Missing or malformed "container" object.');
    }
    res.json({ ...responseTemplate, errors });
  }
});

// #############################################
// ObfuscateSecret
// #############################################

const obfuscateSecretTemplate = {
  stillUpdating: false,
  lastSuccessfulUpdateTimeStampUtc: 0,
  payload: {}, // object with result of the operation
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
};

router.post('/ObfuscateSecret', async (req, res) => {
  // Check we are ship-shape with the params, but we allow empty string for secretToObfuscate
  // (as the password might be nothing)
  const missingSecret = !(
    req
    && req.body
    && req.body.secretToObfuscate !== undefined
  );
  if (
    !missingSecret
  ) {
    const { secretToObfuscate } = req.body;

    const obfuscatedSecret = lrObfuscateSecret(secretToObfuscate);

    res.json({ ...obfuscateSecretTemplate, payload: { obfuscatedSecret } });
  } else {
    const errorMessages = [];
    if (missingSecret) {
      errorMessages.push('Missing or malformed compulsory "secretToObfuscate" string.');
    }
    res.json({ ...obfuscateSecretTemplate, errors: errorMessages, requestBody: (process.env.NODE_ENV === 'development' ? req.body : undefined) });
  }
});

module.exports = router;
