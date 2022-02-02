const express = require('express');

// Service name and version
const version = require('../shared/version'); // Version file is generated at build time
const pipelineTemplates = require('./pipelineTemplates');
// const { stats } = require('./stats');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good',
    version
  });
});

router.use('/pipelineTemplates', pipelineTemplates);
// router.use('/stats', stats);

module.exports = router;
