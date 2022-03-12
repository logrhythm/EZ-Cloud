// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../../shared/database-connector');

// API Helpers
const {
  defaultErrorMessage
} = require('../../shared/api-helpers');

/**
 * Get the list of Publishers
 */
router.get('/', async (req, res) => {
  let foundRecords = [];
  let thereWasAnError = false;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
      SELECT
        publishers.uid,
        publishers.display_name
      FROM publishers
      `
    },
    {
      // Named parameters
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Ship it out!
  res.json(
    {
      action: 'get_publishers__admin',
      description: 'Get the list of Publishers - Admin',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? defaultErrorMessage : undefined)
    }
  );
});

module.exports = router;
