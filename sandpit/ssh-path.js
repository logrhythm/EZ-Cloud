const fs = require('fs');
const configSsh = JSON.parse(fs.readFileSync('../config/ssh.json', 'utf8')).config;

var SSH = require('simple-ssh');

var ssh = new SSH(configSsh);

ssh
// .exec('echo $PATH', {
//     err: function(stderr) {
//         console.error(stderr);
//     },
//     exit: function(code) {
//         console.log('Return code: ' + code);
//     },
//     out: function(stdout) {
//         console.log(stdout);
//     }
// })
// .exec('echo', {
//     args: ['$PATH'],
//     err: function(stderr) {
//         console.error(stderr); // this-does-not-exist: command not found
//     },
//     exit: function(code) {
//         console.log('Return code: ' + code);
//     },
//     out: function(stdout) {
//         console.log(stdout);
//     }
// })
.exec('./test.sh >/dev/null 2>/dev/null || exit 1', {
  err: function(stderr) {
    console.error('ERROR: ' + stderr);
  },
  exit: function(code) {
    console.log('Return code: ' + code);
    if (code === 1) {
      console.log('test.sh not present');
      return false;
    }
  },
  out: function(stdout) {
    console.log('OUTPUT: ' + stdout);
  }
})
.exec('ls test.sh >/dev/null 2>/dev/null || exit 1', {
  err: function(stderr) {
    console.error('ERROR: ' + stderr);
  },
  exit: function(code) {
    console.log('Return code: ' + code);
    if (code === 1) {
      console.log('test.sh (via LS) not present');
      return false;
    }
  },
  out: function(stdout) {
    console.log('OUTPUT: ' + stdout);
  }
})
.exec('./test2.sh >/dev/null 2>/dev/null || exit 1', {
  err: function(stderr) {
    console.error('ERROR: ' + stderr);
  },
  exit: function(code) {
    console.log('Return code: ' + code);
    if (code === 1) {
      console.log('test2.sh cannot run');
      return false;
    }
  },
  out: function(stdout) {
      console.log('OUTPUT: ' + stdout);
  }
})
.exec('ls lrctl >/dev/null 2>/dev/null || exit 1', {
  err: function(stderr) {
      console.error('ERROR: ' + stderr);
  },
  exit: function(code) {
    console.log('Return code: ' + code);
    if (code === 1) {
      console.log('lrctl (via LS) not present');
      return false;
    }
  },
  out: function(stdout) {
    console.log('OUTPUT: ' + stdout);
  }
})
.exec('./lrctl --help >/dev/null 2>/dev/null || exit 1', {
  err: function(stderr) {
    console.error('ERROR: ' + stderr);
  },
  exit: function(code) {
    console.log('Return code: ' + code);
    if (code === 1) {
      console.log('lrctl not present');
      return false;
    }
  },
  out: function(stdout) {
    console.log('OUTPUT: ' + stdout);
  }
})
.start();

// ./lrctl --help >/dev/null 2>/dev/null