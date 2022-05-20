const express = require('express');

// Service name and version
const version = require('../shared/version'); // Version file is generated at build time
// Middlewares
const middlewares = require('../middlewares');
// API sub paths
const pipelineTemplates = require('./pipelineTemplates');
const notifications = require('./notifications');
const publishers = require('./publishers');
const admin = require('./admin');
const stats = require('./stats');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good',
    version
  });
});

router.use('/pipelineTemplates', pipelineTemplates);
router.use('/notifications', notifications);
router.use('/publishers', publishers);
router.use('/stats', stats);
router.use('/admin', middlewares.isLoggedIn, admin);

module.exports = router;
