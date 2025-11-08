const express = require('express');
const router = express.Router();
const { getUserStatuses } = require('../../../controllers/userStatusController');
const { isAuthenticated } = require('../../../middleware/auth');

router.get('/', isAuthenticated, getUserStatuses);

module.exports = router;
