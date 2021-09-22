// https://github.com/coreybutler/node-windows#cleaning-up-uninstall-a-service
const { Service } = require('node-windows');
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'EZ-Cloud Server',
  script: path.join(__dirname, '../src/index.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', () => {
  // eslint-disable-next-line no-console
  console.log('Uninstall complete.');
  // eslint-disable-next-line no-console
  console.log('The service exists: ', svc.exists);
});

// Uninstall the service.
svc.uninstall();
