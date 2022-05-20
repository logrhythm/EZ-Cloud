const express = require('express');

const middlewares = require('../middlewares');
const test = require('./test');
const auth = require('./auth');
const openCollector = require('./openCollector');
const { config } = require('./config');
const { logrhythmCore } = require('./logrhythmCore');
const { ezAdmin } = require('./ezAdmin');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - All good'
  });
});

router.use('/test', test);
router.use('/auth', auth);
router.use('/oc', middlewares.isLoggedIn, openCollector);
router.use('/config', middlewares.isLoggedIn, config);
router.use('/logrhythmCore', middlewares.isLoggedIn, logrhythmCore);
router.use('/admin', middlewares.isAdmin, ezAdmin);

module.exports = router;
