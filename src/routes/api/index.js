const express = require('express');
const messagesRouter = require('./messages');
const ipReputationRouter = require('./ip-reputation');
const authRouter = require('./auth');

const router = express.Router();

router.use('/messages', messagesRouter);
router.use('/ip-reputation', ipReputationRouter);
router.use('/v3/auth', authRouter);

module.exports = router;
