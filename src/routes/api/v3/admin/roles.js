const express = require('express');
const router = express.Router();
const { getRoles } = require('../../../../controllers/roleController');

/**
 * @swagger
 * /api/v3/admin/roles:
 *   get:
 *     summary: List all roles
 *     description: Returns a list of all available user roles. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 */
router.get('/', getRoles);

module.exports = router;
