const express = require('express');
const router = express.Router();
const ipRepController = require('../../../controllers/ipReputationController');

/**
 * @openapi
 * /api/v3/ip/{ip}:
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
 * /api/v3/ip/{ip}/event:
 *   post:
 *     summary: Log IP event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: One of spam, failed_login, hard_block, abuse
 *               country:
 *                 type: string
 *                 description: ISO 3166-1 alpha-2 country code or '??'
 *               caller:
 *                 type: string
 *                 description: Optional caller source identifier
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid event
 */
router.get('/ip/:ip', ipRepController.getIp);
router.post('/ip/:ip/event', ipRepController.postEvent);

module.exports = router;
