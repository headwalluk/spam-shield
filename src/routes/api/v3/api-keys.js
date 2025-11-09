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
  return res.status(403).json({ error: 'forbidden' });
}

/**
 * @openapi
 * /api/v3/api-keys:
 *   get:
 *     summary: List API keys for current user
 *     description: Returns all API keys owned by the authenticated user with role 'user'.
 *     responses:
 *       200:
 *         description: OK
 *   post:
 *     summary: Create a new API key
 *     description: Issues a new API key for the authenticated user with role 'user'.
 *     requestBody:
 *       required: false
 *     responses:
 *       201:
 *         description: Created
 * /api/v3/api-keys/{id}:
 *   put:
 *     summary: Update API key metadata
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete API key
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: No Content
 *       404:
 *         description: Not found
 */

router.use(isAuthenticated, isUser);

router.get('/', getApiKeys);
router.post('/', createApiKey);
router.put('/:id', updateApiKey);
router.delete('/:id', deleteApiKey);

module.exports = router;
