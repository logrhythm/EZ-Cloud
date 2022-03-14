// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../../shared/database-connector');

// Load the System Logging functions
const { logToSystem } = require('../../shared/systemLogging');

// API Helpers
const {
  defaultErrorMessage,
  safePublisherUid,
  safePublisherObject
} = require('../../shared/api-helpers');

/**
 * Get the list of Publishers
 */
router.get('/', async (req, res) => {
  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

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
    errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
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
      error: (thereWasAnError ? errorMessage : undefined)
    }
  );
});

/**
 * Get the content of a specific Publisher
 */
router.get('/:id', async (req, res) => {
  const publisherUid = safePublisherUid(req, 'id');

  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (publisherUid && publisherUid.length) {
    // Query the DB
    try {
      // Query the DB
      foundRecords = await db.pool.query({
        namedPlaceholders: true,
        sql: `
        SELECT
        publishers.uid,
        publishers.display_name
      FROM publishers
        WHERE
          uid = :publisherUid
        `
      },
      {
        // Named parameters
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  } else {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher `UID` provided in the HTTP Query.';
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'get_publishers_and_messages_by_id__admin',
      description: 'Get the content of a specific Publisher - Admin',
      pageNumber: 1,
      pageSize: 1,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? errorMessage : undefined)
    }
  );
});

/**
 * Create a new Publisher
 */
router.post('/', async (req, res) => {
  // Gather the verified Publisher object from the Body of the query
  const publisher = safePublisherObject(req);

  let recordCreationResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!publisher) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `publisher` provided in the HTTP Body.';
  }

  if (!thereWasAnError) {
    // Insert the item
    try {
      recordCreationResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          INSERT
            INTO \`publishers\`
              (
                \`uid\`
                ${publisher.displayName !== null ? ', `display_name`' : '/* No Display Name */'}
              )
            VALUES
              (
                uuid()
                ${publisher.displayName !== null ? ', :publisherDisplayName' : '/* No Display Name present */'}
              );
          `
      },
      {
        // Named parameters
        publisherUid: publisher.publisherUid,
        publisherDisplayName: publisher.displayName
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'create_publisher__admin',
      description: 'Create a new Publisher',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordCreationResult || undefined
    }
  );
});

/**
 * Update a specific Publisher
 */
router.put('/:id', async (req, res) => {
  const publisherUid = safePublisherUid(req, 'id');
  // Gather the verified Publisher object from the Body of the query
  const publisher = safePublisherObject(req);

  let recordUpdateResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!publisher) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `publisher` provided in the HTTP Body.';
  }

  // Checking the UIDs match, as otherwise at least one of them is wrong
  if (
    publisher
    && publisher.publisherUid
    && publisher.publisherUid !== publisherUid
  ) {
    thereWasAnError = true;
    errorMessage = 'UID mismatch between the one provided in `publisher` and the one provided in the HTTP Parameters.';
  }

  if (!thereWasAnError) {
    console.log(publisher); // XXXX
    // Update the item
    try {
      const sql = `
      UPDATE
        \`publishers\`
        SET
          \`uid\` = \`uid\` /* Bogus line. Will change nothing. But help with commas for the subsequent lines. */
          ${publisher.displayName !== null ? ', `diaplay_name` = :publisherDisplayName' : '/* No Display Name present */'}
        WHERE
          \`uid\`=:publisherUid;
      `;
      console.log(sql); // XXXX
      const parameters = {
        // Named parameters
        publisherUid: publisher.publisherUid,
        publisherDisplayName: publisher.displayName
      };
      console.log(parameters); // XXXX
      // Update some of provided fields. If absent, they are left as is.
      recordUpdateResult = await db.pool.query({
        namedPlaceholders: true,
        sql
      },
      parameters);
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'update_publisher__admin',
      description: 'Update a specific Publisher - Admin',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordUpdateResult || undefined
    }
  );
});

/**
 * Delete a specific Publisher
 */
router.delete('/:id', async (req, res) => {
  const publisherUid = safePublisherUid(req, 'id');

  let recordDeletionResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!publisherUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher `UID` provided in the HTTP query parameter.';
  }

  if (!thereWasAnError) {
    // Delete the item
    try {
      recordDeletionResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          DELETE
            FROM
              \`publishers\`
            WHERE
              \`uid\` = :publisherUid
          `
      },
      {
        // Named parameters
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'delete_publisher__admin',
      description: 'Delete a specific Publisher - Admin',
      pageNumber: 1,
      pageSize: 1,
      found: 0,
      returned: 0,
      records: [],
      error: (thereWasAnError ? errorMessage : undefined),
      result: recordDeletionResult || undefined
    }
  );
});

module.exports = router;
