const app = require('./app');

const port = process.env.PORT || 8400;
const host = process.env.HOST || 'localhost';
app.listen(port, host, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://${host}:${port}`);
  /* eslint-enable no-console */
});
