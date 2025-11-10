const express = require('express');
const router = express.Router();
const messageModel = require('../../models/messageModel');

// Ensure the user is authenticated via session or optional header injection in test
function requireLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.user && req.user.id) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

// GET /api/dash/messages?page=&pageSize=&q=
router.get('/messages', requireLoggedIn, async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    const data = await messageModel.listByUser(userId, { page, pageSize, q });

    // For security, avoid returning extremely large strings by truncating message_body in transport
    const items = data.items.map((row) => ({
      ...row,
      message_body:
        row.message_body && row.message_body.length > 500
          ? row.message_body.slice(0, 500) + '…'
          : row.message_body
    }));

    return res.json({ items, pagination: data.pagination });
  } catch (err) {
    console.error('Failed to list user messages', err);
    res.status(500).json({ error: 'Failed to list messages' });
  }
});

module.exports = router;
