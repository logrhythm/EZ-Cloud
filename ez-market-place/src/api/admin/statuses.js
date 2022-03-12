// Express HTTP
const express = require('express');

const router = express.Router();

// API Helpers
const {
  defaultErrorMessage,
  getStatuses
} = require('../../shared/api-helpers');

/**
 * Get the list of Statuses
 */
router.get('/', async (req, res) => {
  // Get the Statuses from the shared function
  const statuses = await getStatuses();
  // Default to empty Array
  const foundRecords = statuses || [];
  // getStatuses returns NULL if there was an error
  const thereWasAnError = statuses === null;

  // Ship it out!
  res.json(
    {
      action: 'get_statuses__admin',
      description: 'Get the list of Statuses - Admin',
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
