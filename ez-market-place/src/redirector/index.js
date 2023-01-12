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

router.get('/:id', async (req, res) => {
  const redirectorPath = safeRedirectorPath(req, 'id');

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
          aka_redirections.uid AS aka_redirectionsUid
          -- aka_redirections.display_name AS displayName
        FROM aka_redirections
          WHERE
            uid = :redirectorPath
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
  } else {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Path provided in the HTTP Query.';
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

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
});

router.get('/', (req, res) => {
  res.json({
    message: 'AKA - All good',
    version
  });
});

module.exports = router;
