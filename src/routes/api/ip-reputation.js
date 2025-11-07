const express = require('express');
const router = express.Router();
const IpReputationController = require('../../controllers/ipReputationController');
const ipReputationService = require('../../services/ipReputationService');
const ipReputationController = new IpReputationController(ipReputationService);

// Define route to get IP reputation
router.get('/:ip', ipReputationController.getIpReputation);

// Define route to log IP activity
router.post('/log', ipReputationController.logIpActivity);

module.exports = router;
