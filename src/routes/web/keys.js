const express = require('express');
const router = express.Router();
const { createApiKey, relabelApiKey, deleteApiKey } = require('../../controllers/apiKeyController');
const { isAuthenticated } = require('../../middleware/auth');

router.post('/', isAuthenticated, createApiKey);
router.post('/:id/relabel', isAuthenticated, relabelApiKey);
router.post('/:id/delete', isAuthenticated, deleteApiKey);

module.exports = router;
