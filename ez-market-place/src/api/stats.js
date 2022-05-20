// Express HTTP
const express = require('express');

const router = express.Router();

// Database connection
const db = require('../shared/database-connector');

// API Helpers
const {
  safeDaysLookBackUid
} = require('../shared/api-helpers');

// Default to 10 years look back
const defaultDaysLookBack = 3653;

/**
 * Get the name of the supported statistics endpoints
 */
router.get('/', async (req, res) => {
  const foundRecords = [
    {
      endpoint: '/',
      query_parameters: [],
      path_parameters: [],
      action: 'get_statistics_enpoints',
      description: 'Get the name of the supported statistics endpoints'
    },
    {
      endpoint: '/market',
      query_parameters: ['daysLookBack'],
      path_parameters: [],
      action: 'get_high_level_statistics',
      description: 'Get the high level statitics: total hits, unique deployments, unique users'
    },
    {
      endpoint: '/pipeline_templates',
      query_parameters: ['daysLookBack'],
      path_parameters: [],
      action: 'get_pipeline_templates_statistics',
      description: 'Get the statitics about the Pipeline Templates: created pipeline templates, unique publishers'
    }
  ];

  // Ship it out!
  res.json(
    {
      action: 'get_statistics_enpoints',
      description: 'Get the name of the supported statistics endpoints',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords
    }
  );
});

/**
 * Get the high level EZ Market statitics: total hits, unique deployments, unique users
 */
router.get('/market', async (req, res) => {
  const daysLookBack = safeDaysLookBackUid(req, 'daysLookBack') || defaultDaysLookBack; // Default to 10 years

  let foundRecords = [];
  let thereWasAnError = false;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
      SELECT
        statistics.date AS day,
        SUM(statistics.count) AS total_hits,
        COUNT(DISTINCT statistics.deployment_uid) AS unique_deployments,
        COUNT(DISTINCT statistics.publisher_uid) AS unique_users
      FROM
        statistics
      WHERE 
        statistics.date >= SUBDATE(NOW(), INTERVAL :daysLookBack DAY)
      GROUP BY
        statistics.date
      ORDER BY
        day
      `
    },
    {
      // Named parameters
      daysLookBack
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Ship it out!
  res.json(
    {
      action: 'get_high_level_statistics',
      description: 'Get the high level statitics: total hits, unique deployments, unique users',
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
 * Get the statitics about the Pipeline Templates: created pipeline templates, unique publishers
 */
router.get('/pipeline_templates', async (req, res) => {
  const daysLookBack = safeDaysLookBackUid(req, 'daysLookBack') || defaultDaysLookBack; // Default to 10 years

  let foundRecords = [];
  let thereWasAnError = false;

  try {
    // Query the DB
    foundRecords = await db.pool.query({
      namedPlaceholders: true,
      sql: `
      SELECT
        CONVERT(pipeline_templates.created, DATE) AS day,
        COUNT(DISTINCT pipeline_templates.uid) AS created_pipeline_templates,
        COUNT(DISTINCT pipeline_templates.publisher_uid) AS unique_publishers
      FROM
        pipeline_templates
      WHERE 
        pipeline_templates.created >= SUBDATE(NOW(), INTERVAL :daysLookBack DAY)
      GROUP BY
        day
      ORDER BY
        day
      `
    },
    {
      // Named parameters
      daysLookBack
    });
  } catch (error) {
    thereWasAnError = true;
  }

  // Ship it out!
  res.json(
    {
      action: 'get_pipeline_templates_statistics',
      description: 'Get the statitics about the Pipeline Templates: created pipeline templates, unique publishers',
      pageNumber: 1,
      pageSize: 100000,
      found: foundRecords.length,
      returned: foundRecords.length,
      records: foundRecords,
      error: (thereWasAnError ? 'Error querying the database' : undefined)
    }
  );
});

module.exports = router;
