const express = require('express');

const router = express.Router();

/**
 * Double check the parameter exists in the request. If not, provide the provided defaultValue.
 * @param {*} req Express Router's request object
 * @param {*} param Name of the parameter to look for in the request
 * @param {*} defaultValue Optional fall back value if the parameter is not found
 * @returns Value of the found parameter, or the provided default value
 */
function rp(req, param, defaultValue = undefined) {
  return (
    // eslint-disable-next-line no-nested-ternary
    req
    && req.params
      ? (
        req.params[param] !== undefined
          ? req.params[param]
          : defaultValue
      )
      : defaultValue
  );
}

/**
 * Get the list of Pipeline Templates
 */
router.get('/', (req, res) => {
  res.json(
    {
      action: 'get_pipeline_templates',
      description: 'Get the list of Pipeline Templates',
      pageNumber: 1,
      pageSize: 100000,
      found: 2,
      returned: 2,
      records: [
        '🥌',
        '🚀'
      ]
    }
  );
});

/**
 * Get the content of a specific Pipeline Template
 */
router.get('/:id', (req, res) => {
  const pipelineTemplateId = rp(req, 'id');

  res.json(
    {
      action: 'get_pipeline_templates',
      description: 'Get the list of Pipeline Templates',
      pageNumber: 1,
      pageSize: 100000,
      found: 2,
      returned: 2,
      records: [
        '🥌',
        '🚀'
      ]
    }
  );
});

/**
 * Create a new Pipeline Template
 */
router.post('/', (req, res) => {
  res.json(['🥌', 'id']);
});

/**
 * Update a specific Pipeline Template
 */
router.put('/:id', (req, res) => {
  res.json(['🥌', 'id']);
});

/**
 * Delete a specific Pipeline Template
 */
router.delete('/:id', (req, res) => {
  res.json(['🥌', 'id']);
});

module.exports = router;
