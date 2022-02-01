const express = require('express');

// Service name and version
const version = require('../shared/version'); // Version file is generated at build time
const pipelinesTemplates = require('./pipelinesTemplates');
// const { stats } = require('./stats');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good',
    version
  });
});

router.use('/pipelinesTemplates', pipelinesTemplates);
// router.use('/stats', stats);

module.exports = router;
