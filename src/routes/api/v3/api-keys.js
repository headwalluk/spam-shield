const express = require('express');
const router = express.Router();
const {
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey
} = require('../../../controllers/apiKeyApiController');
const { isAuthenticated } = require('../../../middleware/auth');

function isUser(req, res, next) {
  if (req.user && req.user.roles.includes('user')) {
    return next();
  }
  res.status(403).send('Forbidden D');
}

router.use(isAuthenticated, isUser);

router.get('/', getApiKeys);
router.post('/', createApiKey);
router.put('/:id', updateApiKey);
router.delete('/:id', deleteApiKey);

module.exports = router;
