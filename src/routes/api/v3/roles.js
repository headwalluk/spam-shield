const express = require('express');
const router = express.Router();
const { getRoles } = require('../../../controllers/roleController');
const { requireAuth } = require('../../../middleware/authz');

/**
 * @swagger
 * /api/v3/roles:
 *   get:
 *     summary: List roles
 *     description: Returns all available roles. Requires authentication.
 *     tags: [Roles]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 */
// GET /api/v3/roles - authenticated users can view role list
router.get('/', requireAuth, getRoles);

// Future: POST/PUT/DELETE could go here with requireAdmin
// e.g., router.post('/', requireAdmin, createRole);

module.exports = router;
