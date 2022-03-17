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
  safeNotificationUid,
  safeNotificationObject
} = require('../../shared/api-helpers');

/**
 * Get the list of Notifications / Messages for a given Producer UID
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
          messages.uid AS messageUid,
          messages.sent_On AS sentOn,
          messages.updated_On AS updatedOn,
          messages.recipient_Uid AS recipientUid,
          publishers_recipient.display_name AS recipient,
          messages.sender_Uid AS senderUid,
          publishers_sender.display_name AS sender,
          messages.status AS statusId,
          statuses.name AS statusName,
          statuses.description AS statusDescription,
          messages.message AS messageContent,
          messages.flags AS messageFlags
        FROM messages
          LEFT OUTER JOIN publishers publishers_recipient
            ON messages.recipient_Uid = publishers_recipient.uid
          LEFT OUTER JOIN publishers publishers_sender
            ON messages.sender_Uid = publishers_sender.uid
          INNER JOIN statuses
            ON messages.status = statuses.id
        ORDER BY
          sentOn DESC -- Newest items on top
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
      action: 'get_notifications_and_messages__admin',
      description: 'Get the list of all Notifications / Messages - Admin',
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
 * Get the content of a specific Notification / Message
 */
router.get('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');

  let foundRecords = [];
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (notificationUid && notificationUid.length) {
    // Query the DB
    try {
      // Query the DB
      foundRecords = await db.pool.query({
        namedPlaceholders: true,
        sql: `
        SELECT
          messages.uid AS messageUid,
          messages.sent_On AS sentOn,
          messages.updated_On AS updatedOn,
          publishers_recipient.display_name AS recipient,
          publishers_sender.display_name AS sender,
          statuses.name AS statusName,
          statuses.description AS statusDescription,
          messages.message AS messageContent,
          messages.flags AS messageFlags
        FROM messages
          LEFT OUTER JOIN publishers publishers_recipient
            ON messages.recipient_Uid = publishers_recipient.uid
          LEFT OUTER JOIN publishers publishers_sender
            ON messages.sender_Uid = publishers_sender.uid
          INNER JOIN statuses
            ON messages.status = statuses.id
        WHERE
          messages.uid = :messageUid
        `
      },
      {
        // Named parameters
        messageUid: notificationUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error querying the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
      logToSystem('Debug', `${errorMessage} // ${JSON.stringify(error)}`, true);
    }
  } else {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Notification `UID` provided in the HTTP Query.';
  }

  // Log potential Error
  if (thereWasAnError) {
    logToSystem('Error', errorMessage, true);
  }

  res.json(
    {
      action: 'get_notifications_and_messages_by_id__admin',
      description: 'Get the content of a specific Notification / Message - Admin',
      pageNumber: 1,
      pageSize: 1,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

/**
 * Create a new Notification / Message
 */
router.post('/', async (req, res) => {
  // Gather the verified Notification/Message object from the Body of the query
  const notification = safeNotificationObject(req);

  let recordCreationResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!notification) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `notification` provided in the HTTP Body.';
  }

  if (!thereWasAnError) {
    // Safely parse the Flags
    let templateFlags = null;
    try {
      templateFlags = JSON.stringify(notification.flags || []);
    } catch (error) {
      // Fail silently
    }

    // Insert the item
    try {
      recordCreationResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          INSERT
            INTO \`messages\`
              (
                \`uid\`
                ${notification.statusId !== null ? ', `status`' : '/* No Status present */'}
                ${notification.senderUid !== undefined ? ', `sender_Uid`' : '/* No Sender present */'}
                ${notification.recipientUid !== undefined ? ', `recipient_Uid`' : '/* No Recipient present */'}
                ${notification.messageContent ? ', `message`' : '/* No Message Content present */'}
                ${notification.flags ? ', `flags`' : '/* No Flags present */'}
              )
            VALUES
              (
                uuid()
                ${notification.statusId !== null ? ', :notificationStatusAsInt' : '/* No Status present */'}
                ${notification.senderUid !== undefined ? ', :senderUid' : '/* No Sender present */'}
                ${notification.recipientUid !== undefined ? ', :recipientUid' : '/* No Recipient present */'}
                ${notification.messageContent ? ', :messageContent' : '/* No Message Content present */'}
                ${notification.flags ? ', :templateFlags' : '/* No Flags present */'}
              );
          `
      },
      {
        // Named parameters
        notificationUid: notification.messageUid,
        notificationStatusAsInt: notification.statusId,
        senderUid: notification.senderUid,
        recipientUid: notification.recipientUid,
        messageContent: notification.messageContent,
        templateFlags // Already parsed above
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
      action: 'create_notification_and_message__admin',
      description: 'Create a new Notification / Message',
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
 * Update a specific Notification / Message
 */
router.put('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');
  // Gather the verified Notification/Message object from the Body of the query
  const notification = safeNotificationObject(req);

  let recordUpdateResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!notification) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid `notification` provided in the HTTP Body.';
  }

  // Checking the UIDs match, as otherwise at least one of them is wrong
  if (
    notification
    && notification.messageUid
    && notification.messageUid !== notificationUid
  ) {
    thereWasAnError = true;
    errorMessage = 'UID mismatch between the one provided in `notification` and the one provided in the HTTP Parameters.';
  }

  if (!thereWasAnError) {
    // const messageContent = generateMessageContentFromTemplate(notification);

    // Safely parse the Flags
    let templateFlags = null;
    try {
      templateFlags = JSON.stringify(notification.flags || []);
    } catch (error) {
      // Fail silently
    }
    console.log(notification); // XXXX
    // Update the item
    try {
      const sql = `
      UPDATE
        \`messages\`
        SET
          \`uid\` = \`uid\` /* Bogus line. Will change nothing. But help with commas for the subsequent lines. */
          ${notification.statusId !== null ? ', `status` = :notificationStatusAsInt' : '/* No Status present */'}
          ${notification.senderUid !== undefined ? ', `sender_Uid` = :senderUid' : '/* No Sender present */'}
          ${notification.recipientUid !== undefined ? ', `recipient_Uid` = :recipientUid' : '/* No Recipient present */'}
          ${notification.messageContent ? ', `message` = :messageContent' : '/* No Message Content present */'}
          ${notification.flags ? ', `flags` = :templateFlags' : '/* No Flags present */'}
        WHERE
          \`uid\`=:notificationUid;
      `;
      console.log(sql); // XXXX
      const parameters = {
        // Named parameters
        notificationUid: notification.messageUid,
        notificationStatusAsInt: notification.statusId,
        senderUid: notification.senderUid,
        recipientUid: notification.recipientUid,
        messageContent: notification.messageContent,
        templateFlags // Already parsed above
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
      action: 'update_notification_and_message__admin',
      description: 'Update a specific Notification / Message - Admin',
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
 * Delete a specific Notification / Message
 */
router.delete('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');

  let recordDeletionResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!notificationUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Notification/Message `UID` provided in the HTTP query parameter.';
  }

  if (!thereWasAnError) {
    // Delete the item
    try {
      recordDeletionResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          DELETE
            FROM
              \`messages\`
            WHERE
              \`uid\` = :notificationUid
          `
      },
      {
        // Named parameters
        notificationUid
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
      action: 'delete_notification_and_message__admin',
      description: 'Delete a specific Notification / Message - Admin',
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
