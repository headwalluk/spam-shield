const express = require('express');
const v3MessagesRouter = require('./v3/messages');
const v3IpReputationRouter = require('./v3/ip-reputation');
const v3AuthRouter = require('./v3/auth');

const router = express.Router();

router.use('/v3/messages', v3MessagesRouter);
router.use('/v3/ip-reputation', v3IpReputationRouter);
router.use('/v3/auth', v3AuthRouter);

module.exports = router;
