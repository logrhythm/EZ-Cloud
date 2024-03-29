const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

const middlewares = require('./middlewares');
const api = require('./api');
const redirector = require('./redirector');

// Extract the deployment and publisher UIDs from the "ez-publisher" Header
app.use(middlewares.extractDeploymentAndPublishUids);
// Extract the Version numbers of EZ Server and EZ Client from the "ez-server-version"
// and "ez-client-version" Headers
app.use(middlewares.extractServerAndClientVersions);

// Check for JWT token in the headers, and if found populate the req object accordingly
app.use(middlewares.checkJwTokenAndSetUser);

// Log the Web requests / responses to the System Journal
app.use(middlewares.logHttpToSystem);
// Track statistics into database
app.use(middlewares.trackStatsToDatabase);

// To protect against clickjacking
app.use(middlewares.setXFrameOptions);
app.use(middlewares.setContentSecurityPolicy);

app.get('/test', (req, res) => {
  res.json({
    message: '👋 All good mate'
  });
});

app.use('/API/v1', api);
// For Help page redirection
app.use('/aka', redirector);

// // Static web site hosting:
// // - First, the home page
// app.get('/', (req, res) => {
//   res.sendFile(path.join(process.env.baseDirname, 'public_web_root', 'index.html'));
// });

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
