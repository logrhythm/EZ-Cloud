// const app = require('./app');
const httpsServer = require('./app');

const port = process.env.PORT || 8400;
const host = process.env.HOST || 'localhost';

// Service name and version
process.env.NAME = 'EZ-Cloud Onboarding for Legacy SIEM';
process.env.VERSION = '0.0.1';

// app.listen(port, host, () => {
httpsServer.listen(port, host, () => {
  /* eslint-disable no-console */
  console.log(`${process.env.NAME} - Version: ${process.env.VERSION}`);
  console.log(`Listening: http://${host}:${port}`);
  /* eslint-enable no-console */
});
