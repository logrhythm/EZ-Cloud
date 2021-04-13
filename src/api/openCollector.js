const express = require('express');
const router = express.Router();
// Get SSH config
const fs = require('fs');
const path = require('path');
// const configSsh = JSON.parse(fs.readFileSync(__dirname + '\\..\\..\\config\\' + 'ssh.json', 'utf8')).config;
const configSsh = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'ssh.json'), 'utf8')).config;
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
        } 
        catch {
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

var ocVersion = {
  stillChecking: false,
  lastSuccessfulCheckTimeStampUtc: 0,
  payload: { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } }, // object with version
  errors: [], // array of all the errors
  outputs: [] // array of all the outputs
}

function checkOCVersion () {
  var ssh = new SSH(configSsh);

  ocVersion.stillChecking = true;
  ocVersion.errors = [];
  ocVersion.outputs = [];
  ocVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };

  ssh
    .exec('./lrctl status 2>/dev/null | grep -i open_collector 2>/dev/null', {
      err: function(stderr) {
        ocVersion.errors.push(stderr);
      },
      exit: function(code) {
        ocVersion.lastSuccessfulCheckTimeStampUtc = Date.now() / 1000;
      },
      out: function(stdout) {
        version = stdout.match(/open_collector *(([0-9]+)\.([0-9]+)\.([0-9]+))/);
        if (version.length > 0) {
          ocVersion.payload = { version: { detailed: { major: version[2], minor: version[3], build: version[4] }, Full: version[1] } };
        } else
        {
          ocVersion.payload = { version: { detailed: { major: -1, minor: 0, build: 0 }, Full: '-1' } };
        }
        ocVersion.outputs.push(stdout);
      }
    })
    .on('end', function(err) {
      ocVersion.stillChecking = false;
    })
    .start({
      failure: function () {
        ocVersion.stillChecking = false;
      }
    });
}

router.get('/CheckOCVersion', async (req, res) => {
  if (req.query.NoWait === undefined || (req.query.NoWait !== undefined && req.query.NoWait.toLowerCase() !== 'true')) {
    // Waiting - Sync
    if (!ocVersion.stillChecking) {
      checkOCVersion();
    }
    const loopEndTime = Date.now() / 1000 + maxCheckInterval

    while (ocVersion.stillChecking && (loopEndTime > (Date.now() / 1000))) {
      // Wait for 50 ms
      await waitMilliseconds(50);
    }
  } else {
    // No waiting - Async
    if (!ocVersion.stillChecking && (ocVersion.lastSuccessfulCheckTimeStampUtc + maxCheckInterval) <= (Date.now() / 1000)) {
      checkOCVersion();
    }
  }
  
  res.json(ocVersion);

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
