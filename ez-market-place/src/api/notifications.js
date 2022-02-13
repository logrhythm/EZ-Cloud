// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../shared/database-connector');

// API Helpers
const {
  defaultErrorMessage,
  safeNotificationUid,
  safeNotificationObject
} = require('../shared/api-helpers');

/**
 * Get the list of Notifications / Messages for a given Producer UID
 */
router.get('/', async (req, res) => {
  const { publisherUid } = req.ezPublisherHeader;

  let foundRecords = [];
  let thereWasAnError = false;

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
          (
            statuses.id = 5 -- The item is marked as Not Read
            OR
            statuses.id = 6 -- The item is marked as Read
          )
          AND
          (
            messages.recipient_Uid = :publisherUid -- Items sent to the Publisher him/herself
            OR
            messages.recipient_Uid IS NULL -- Items sent to all Publishers
          )
        ORDER BY
          sentOn DESC -- Newest items on top
      `
    },
    {
      // Named parameters
      publisherUid
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Ship it out!
  res.json(
    {
      action: 'get_notifications_and_messages_to_producer',
      description: 'Get the list of Notifications / Messages sent a given Producer UID',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

/**
 * Get the content of a specific Notification / Message
 */
router.get('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;

  let foundRecords = [];
  let thereWasAnError = false;

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
          AND
          (
            statuses.id = 5 -- The item is marked as Not Read
            OR
            statuses.id = 6 -- The item is marked as Read
          )
          AND
          (
            messages.recipient_Uid = :publisherUid -- Items sent to the Publisher him/herself
            OR
            messages.recipient_Uid IS NULL -- Items sent to all Publishers
          )
        `
      },
      {
        // Named parameters
        messageUid: notificationUid,
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
    }
  }

  res.json(
    {
      action: 'get_notifications_and_messages_by_id',
      description: 'Get the content of a specific Notification / Message',
      pageNumber: 1,
      pageSize: 1,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

// /**
//  * Get the name of a Pipeline Template by its UID
//  * @param {String} uid Pipeline Template's UID
//  * @returns Name of the Pipeline Template
//  */
// function getPipelineTemplateName(uid) {
//   return '';
// }

// /**
//  * Generate a plain English message based on a template and data from the user
//  * @param {Object} notification Valid Notification object
//  */
// function generateMessageContentFromTemplate(notification) {
//   let messageContent = null;

//   if (notification) {
//     // Fall back on the code itself
//     messageContent = notification.messageTemplateCode;
//     if (
//       notification.messageTemplateCode === 'anonymous_liked_pipelinetemplate'
//       && notification.relatedPipelineTemplate
//       && notification.relatedPipelineTemplate.length
//     ) {
//       const pipelineTemplateName = getPipelineTemplateName(notification.relatedPipelineTemplate);
//       messageContent = `A user liked your Pipeline Template "${pipelineTemplateName}".`;
//     } else if (
//       notification.messageTemplateCode === 'publisher_liked_pipelinetemplate'
//       && notification.relatedPipelineTemplate
//       && notification.relatedPipelineTemplate.length
//     ) {
//       const pipelineTemplateName = getPipelineTemplateName(notification.relatedPipelineTemplate);
//       messageContent = `I liked your Pipeline Template "${pipelineTemplateName}".`;
//     }
//     // if (notification.messageTemplateCode === '') {
//     //   messageContent = '';
//     // }
//   }
//   return messageContent;
// }

/**
 * Update a specific Notification / Message
 */
router.put('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;
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

  if (!publisherUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher UID provided in the `ez-publisher` HTTP Header.';
  }

  // // Structure for a Notification/Message creation or update
  // const notificationSchema = yup.object().shape(
  //   {
  //     notificationUid: yup.string().uuid(), // Only required for Updates
  //     senderUid: yup.string().uuid(),
  //     recipientUid: yup.string().uuid(),
  //     status: yup.string(),
  //     messageContent: yup.string(),
  //     messageTemplateCode: yup.string(),
  //     relatedPipelineTemplate: yup.string().uuid(),
  //     flags: yup.object()
  //   }
  // );

  if (!thereWasAnError) {
    // const messageContent = generateMessageContentFromTemplate(notification);

    // Update the item
    try {
      // Update some of provided fields. If absent, they are left as is.
      recordUpdateResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          UPDATE
            \`ez-market-place\`.\`messages\`
            SET
              ${notification.status ? '`status` = :notificationStatusAsInt' : '/* No Status present */'}
              ${notification.status && notification.flags ? ',' : ''}
              ${notification.flags ? '`flags` = :templateFlags' : '/* No Flags present */'}
            WHERE
              \`uid\`=:notificationUid;
          `
      },
      {
        // Named parameters
        notificationUid: notification.messageUid,
        notificationStatusAsInt: (notification.status === 'Unread' ? 5 : 6), // Only allow flicking between Read (6) and Unread (5)
        templateFlags: notification.flags || {}
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    }
  }

  res.json(
    {
      action: 'update_notification_and_message',
      description: 'Update a specific Notification / Message',
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
 * Delete a specific Pipeline Template
 */
router.delete('/:id', async (req, res) => {
  const notificationUid = safeNotificationUid(req, 'id');
  const { publisherUid } = req.ezPublisherHeader;

  let recordDeletionResult = null;
  let thereWasAnError = false;
  let errorMessage = defaultErrorMessage;

  if (!notificationUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Pipeline Template `UID` provided in the HTTP query parameter.';
  }

  if (!publisherUid) {
    thereWasAnError = true;
    errorMessage = 'Missing or invalid Publisher UID provided in the `ez-publisher` HTTP Header.';
  }

  if (!thereWasAnError) {
    // Delete the item
    try {
      recordDeletionResult = await db.pool.query({
        namedPlaceholders: true,
        sql: `
          DELETE
            FROM
              \`ez-market-place\`.\`messages\`
            WHERE
              \`uid\` = :notificationUid
              AND
              \`recipient_uid\` = :publisherUid;
          `
      },
      {
        // Named parameters
        notificationUid,
        publisherUid
      });
    } catch (error) {
      thereWasAnError = true;
      errorMessage = `Error updating the database. Code: ${(error && error.code ? error.code : 'N/A')}`;
    }
  }

  res.json(
    {
      action: 'delete_notification_and_message',
      description: 'Delete a specific Notification / Message',
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
