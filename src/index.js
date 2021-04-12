const app = require('./app');

const port = process.env.PORT || 8400;
const host = process.env.HOST || 'localhost';

// Script version
process.env.VERSION = '0.0.1';

app.listen(port, host, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://${host}:${port}`);
  /* eslint-enable no-console */
});
