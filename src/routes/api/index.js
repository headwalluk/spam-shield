const express = require('express');
const v3MessagesRouter = require('./v3/messages');
const v3IpReputationRouter = require('./v3/ip-reputation');
const v3AuthRouter = require('./v3/auth');
const v3AdminRouter = require('./v3/admin');
const v3UserStatusesRouter = require('./v3/user-statuses');
const v3ApiKeysRouter = require('./v3/api-keys');
const v3StateRouter = require('./v3/state');

const router = express.Router();

router.use('/v3/messages', v3MessagesRouter);
router.use('/v3/ip-reputation', v3IpReputationRouter);
router.use('/v3/auth', v3AuthRouter);
router.use('/v3/admin', v3AdminRouter);
router.use('/v3/user-statuses', v3UserStatusesRouter);
router.use('/v3/api-keys', v3ApiKeysRouter);
router.use('/v3/state', v3StateRouter);

module.exports = router;
