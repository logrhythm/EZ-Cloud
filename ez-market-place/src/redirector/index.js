const express = require('express');

// Service name and version
const version = require('../shared/version'); // Version file is generated at build time

const router = express.Router();

// Database connection
const db = require('../shared/database-connector');

// Load the System Logging functions
const { logToSystem } = require('../shared/systemLogging');

// API Helpers
const {
  defaultErrorMessage,
  safeRedirectorPath
} = require('../shared/api-helpers');

router.get('/', (req, res) => {
  res.json({
    message: 'AKA - Please provide a UID or Path to get redirected to the right place.',
    version: ((process.env.NODE_ENV === 'development' ? version : undefined))
  });
});

router.get('/:path(*)', async (req, res) => {
  const redirectorPath = safeRedirectorPath(req, 'path');

  logToSystem('Debug', `AKA - redirectorPath: "${redirectorPath}"`, true);

  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (redirectorPath && redirectorPath.length) {
    // Query the DB
    try {
      // Query the DB
      foundRecords = await db.pool.query({
        namedPlaceholders: true,
        sql: `
        SELECT
          -- aka_redirections.uid AS aka_redirectionsUid,
          aka_redirections.target_server AS targetServer,
          aka_redirections.target_path AS targetPath
        FROM aka_redirections
          WHERE
            uid = lower(:redirectorPath)
            OR
            lower(short_path) = lower(:redirectorPath)
        `
      },
      {
        // Named parameters
        redirectorPath
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }

    // Let's redirect the user

    // Fall back to the server's default
    let targetUrl = process.env.AKA_DEFAULT_TARGET_SERVER + process.env.AKA_DEFAULT_TARGET_PATH;
    let foundTargetIn = '';

    if (foundRecords && foundRecords.length) {
      // Best case scenario: we found an entry for the key
      targetUrl = foundRecords[0].targetServer + foundRecords[0].targetPath;
      // console.log('FOUND IN DB', foundRecords); // XXXX

      foundTargetIn = 'Redirection Database';
    } else if (String(redirectorPath || '').indexOf(process.env.AKA_DEFAULT_ERROR_TAG || 'ERROR') === 0) {
      // No entry, but path starts with the "ERROR" tag
      targetUrl = process.env.AKA_DEFAULT_TARGET_SERVER
      + process.env.AKA_DEFAULT_ERROR_TARGET_PATH_BASE
      + redirectorPath.slice((process.env.AKA_DEFAULT_ERROR_TAG || 'ERROR').length); // Send the path minus the tag

      foundTargetIn = 'Fallback Error Tag';
    } else if (String(redirectorPath || '').indexOf(process.env.AKA_DEFAULT_HELP_TAG || 'HELP') === 0) {
      // No entry, but path starts with the "HELP" tag
      targetUrl = process.env.AKA_DEFAULT_TARGET_SERVER
      + process.env.AKA_DEFAULT_HELP_TARGET_PATH_BASE
      + redirectorPath.slice((process.env.AKA_DEFAULT_HELP_TAG || 'HELP').length); // Send the path minus the tag;

      foundTargetIn = 'Fallback Help Tag';
    }

    logToSystem('Verbose', `AKA - Redirecting: "${redirectorPath}" via: "${foundTargetIn}" to: "${targetUrl}"`, true);

    // Send client on its merry way
    res.redirect(307, targetUrl);
    // 🚀
  } else {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Path provided in the HTTP Query.';
    logToSystem('Error', errorMessage, true);

    res.json(
      {
        action: 'get_aka',
        description: 'AKA',
        pageNumber: 1,
        pageSize: 1,
        found: foundRecords.length,
        returned: foundRecords.length,
        records: foundRecords,
        error: (thereWasAnError ? errorMessage : undefined)
      }
    );
  }
});

module.exports = router;
