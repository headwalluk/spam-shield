const express = require('express');
const router = express.Router();
const messagesController = require('../../controllers/messagesController');

// Create a new message
router.post('/', messagesController.createMessage);

// Get all messages
router.get('/', messagesController.getMessages);

// Get a specific message by ID
router.get('/:id', messagesController.getMessageById);

// Update a message by ID
router.put('/:id', messagesController.updateMessage);

// Delete a message by ID
router.delete('/:id', messagesController.deleteMessage);

module.exports = router;
