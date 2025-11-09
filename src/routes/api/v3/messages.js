const express = require('express');
const router = express.Router();
const messagesController = require('../../../controllers/messagesController');
const { requireUserRole } = require('../../../middleware/authz');

/**
 * @openapi
 * /api/v3/messages:
 *   post:
 *     summary: Classify a message and log it
 *     description: Accepts a message payload, optional hints, and classifies it as spam/ham while logging the event to message_log.
 *     parameters:
 *       - in: header
 *         name: X-Caller
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional identifier for the caller (e.g. hostname)
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ip:
 *                 type: string
 *               fields:
 *                 type: object
 *                 additionalProperties: true
 *               hints:
 *                 type: object
 *                 properties:
 *                   forceToSpam:
 *                     type: boolean
 *                   countryRestrictions:
 *                     type: object
 *                     properties:
 *                       mode:
 *                         type: string
 *                         enum: [blockList]
 *                       countryCodes:
 *                         type: array
 *                         items:
 *                           type: string
 *                   scriptRestriction:
 *                     type: object
 *                     properties:
 *                       alphabet:
 *                         type: string
 *                         enum: [westernLatin]
 *                       mode:
 *                         type: string
 *                         enum: [minimumCharacterPercentage]
 *                       threshold:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 1
 *               message:
 *                 type: string
 *                 description: Message body to classify
 *     responses:
 *       201:
 *         description: Created with classification result. Response contains only { result, timing } to minimize PII exposure.
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: List messages (scaffold)
 *     responses:
 *       200:
 *         description: OK
 *
 * /api/v3/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update message by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete message by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Not found
 */

router.post('/', requireUserRole, messagesController.createMessage);
router.get('/', messagesController.getMessages);
router.get('/:id', messagesController.getMessageById);
router.put('/:id', messagesController.updateMessage);
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;
