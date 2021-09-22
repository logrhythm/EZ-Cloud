// Full doc at:
// https://github.com/coreybutler/node-windows

const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'EZ-Cloud Server',
  description: 'The Backend server of the EZ-Cloud for Legacy SIEM',
  script: path.join(__dirname, '../src/index.js')
  //  nodeOptions: [
  //    '--harmony',
  //    '--max_old_space_size=4096'
  //  ],
  // , workingDirectory: '...'
  // , allowServiceLogon: true});
});

// https://github.com/coreybutler/node-windows#user-account-attributes
// svc.logOnAs.domain = 'mydomain.local';
// svc.logOnAs.account = 'username';
// svc.logOnAs.password = 'password';

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', () => {
  // svc.start();
});

svc.install();
