const express = require('express');

const router = express.Router();

/**
 * Get the list of Pipeline Templates
 */
router.get('/', (req, res) => {
  res.json(['🥌', '🚀']);
});

/**
 * Get the content of a specific Pipeline Template
 */
router.get('/:id', (req, res) => {
  res.json(['🥌', 'id']);
});

module.exports = router;
