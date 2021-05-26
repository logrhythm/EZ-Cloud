const express = require('express');

const router = express.Router();
const middlewares = require('../middlewares');

router.get('/', (req, res) => {
  res.json(['👍', '✔']);
});

router.get('/authenticated', middlewares.isLoggedIn, (req, res) => {
  res.json(['👍', '✔']);
});

module.exports = router;
