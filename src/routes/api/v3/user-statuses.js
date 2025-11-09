const express = require('express');
const router = express.Router();
const { getUserStatuses } = require('../../../controllers/userStatusController');
const { requireAuth } = require('../../../middleware/authz');

/**
 * @swagger
 * /api/v3/user-statuses:
 *   get:
 *     summary: List user statuses
 *     description: Returns all defined user statuses. Requires authentication.
 *     tags: [UserStatuses]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     responses:
 *       200:
 *         description: A list of user statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   slug: { type: string }
 *                   title: { type: string }
 */
// GET /api/v3/user-statuses - authenticated users can view
router.get('/', requireAuth, getUserStatuses);

module.exports = router;
