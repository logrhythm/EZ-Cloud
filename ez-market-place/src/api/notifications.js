// Express HTTP
const express = require('express');

const router = express.Router();

// // Schema validation
// const yup = require('yup');

// // Database connection
// const db = require('../shared/database-connector');

router.get('/', (req, res) => {
  res.json([
    {
      message: 'Welcome'
    }
  ]);
});

module.exports = router;
