const express = require('express');

const test = require('./test');
const openCollector = require('./openCollector');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good'
  });
});

router.use('/test', test);
router.use('/oc', openCollector);

module.exports = router;
