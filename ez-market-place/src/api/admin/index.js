const express = require('express');

// Service name and version
const version = require('../../shared/version'); // Version file is generated at build time
// const pipelineTemplates = require('./pipelineTemplates');
const notifications = require('./notifications');
const statuses = require('./statuses');
const publishers = require('./publishers');
// const stats = require('./stats');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good',
    version
  });
});

// router.use('/pipelineTemplates', pipelineTemplates);
router.use('/notifications', notifications);
router.use('/statuses', statuses);
router.use('/publishers', publishers);
// router.use('/stats', stats);

router.get('/GetRolesList', (req, res) => {
  res.json({
    message: 'API - All good',
    version
  });
});

module.exports = router;
