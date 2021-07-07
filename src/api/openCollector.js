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

const maxCheckInterval = 10; // Check once every X seconds max, and/or timeout after X seconds

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
      osVersionArray[uid] = Object.assign({}, osVersionTemplate);
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
      fbVersionArray[uid] = Object.assign({}, fbVersionTemplate);
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
      ocVersionArray[uid] = Object.assign({}, ocVersionTemplate);
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


module.exports = router;
