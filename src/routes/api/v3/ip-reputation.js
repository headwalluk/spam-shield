const express = require('express');
const router = express.Router();
const IpReputationController = require('../../../controllers/ipReputationController');
const ipReputationService = require('../../../services/ipReputationService');
const ipReputationController = new IpReputationController(ipReputationService);

/**
 * @openapi
 * /api/v3/ip-reputation/{ip}:
 *   get:
 *     summary: Get IP reputation (scaffold)
 *     parameters:
 *       - in: path
 *         name: ip
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *
 * /api/v3/ip-reputation/log:
 *   post:
 *     summary: Log IP activity
 *     responses:
 *       200:
 *         description: OK
 */

router.get('/:ip', ipReputationController.getIpReputation);
router.post('/log', ipReputationController.logIpActivity);

module.exports = router;
