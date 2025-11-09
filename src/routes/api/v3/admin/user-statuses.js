const express = require('express');
const router = express.Router();
const { getUserStatuses } = require('../../../../controllers/userStatusController');

/**
 * @swagger
 * /api/v3/admin/user-statuses:
 *   get:
 *     summary: List all user statuses
 *     description: Returns a list of all available user statuses. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: A list of user statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserStatus'
 *       403:
 *         description: Forbidden (not an administrator)
 */
router.get('/', getUserStatuses);

module.exports = router;
