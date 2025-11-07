const express = require('express');
const router = express.Router();
const messagesController = require('../../../controllers/messagesController');

/**
 * @openapi
 * /api/v3/messages:
 *   post:
 *     summary: Create a new message (scaffold)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *             required:
 *               - text
 *     responses:
 *       201:
 *         description: Created
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

router.post('/', messagesController.createMessage);
router.get('/', messagesController.getMessages);
router.get('/:id', messagesController.getMessageById);
router.put('/:id', messagesController.updateMessage);
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;
