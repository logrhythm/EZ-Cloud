const express = require('express');
const router = express.Router();
// Get SSH config
const fs = require('fs');
const configSsh = JSON.parse(fs.readFileSync(__dirname + '\\..\\..\\config\\' + 'ssh.json', 'utf8')).config;
// Create SSH object
var SSH = require('simple-ssh');

function waitMilliseconds(delay = 250) {
  return new Promise(resolve => {
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
// CheckOSVersion
// #############################################

var osVersion = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: null, // null (unchecked) or object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkOSVersion () {
  var ssh = new SSH(configSsh);

  osVersion.stillChecking = true;
  osVersion.errors = [];
  osVersion.outputs = [];
  osVersion.payload = null;

  ssh
    .exec('uname -r | awk -F. -v OFS= \'{print "{\\"version\\":{\\"detailed\\":{\\"major\\":\\""$1,"\\", \\"minor\\":\\""$2,"\\", \\"build\\":\\""$3,"\\"}, \\"full\\":\\""$1,"."$2,"."$3,"."$4,"."$5,"\\"}}"}\'', {
      err: function(stderr) {
        osVersion.errors.push(stderr);
      },
      exit: function(code) {
        osVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        try {
          osVersion.payload = JSON.parse(stdout);
        } catch
        {
          osVersion.payload = null;
        }
        osVersion.outputs.push(stdout);
        osVersion.stillChecking = false;
      }
    })
    .on('end', function(err) {
      osVersion.stillChecking = false;
    })
    .start({
      failure: function () {
        osVersion.stillChecking = false;
      }
    });
}

router.get('/CheckOSVersion', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!osVersion.stillChecking) {
      console.log('checkOSVersion()');
      checkOSVersion();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (osVersion.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!osVersion.stillChecking && (osVersion.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkOSVersion();
    }
  }
  
  console.log('return')
  res.json(osVersion);

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
  
  console.log('return')
  res.json(dockerPresence);

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



module.exports = router;
