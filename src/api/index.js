const express = require('express');

const middlewares = require('../middlewares');
const test = require('./test');
const auth = require('./auth');
const openCollector = require('./openCollector');
const config = require('./config');

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

module.exports = router;
