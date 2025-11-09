const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../../../controllers/userController');
const { requireAdmin } = require('../../../middleware/authz');

/**
 * @swagger
 * /api/v3/users:
 *   get:
 *     summary: List users
 *     description: Paginated list of users (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/EmailFilterParam'
 *     responses:
 *       200:
 *         description: Users page
 *   post:
 *     summary: Create user
 *     description: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: Created
 * /api/v3/users/{id}:
 *   get:
 *     summary: Get user
 *     description: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *   put:
 *     summary: Update user
 *     description: Update user (partial) (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
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
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *   delete:
 *     summary: Delete user
 *     description: Delete user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - ApiKeyAuth: []
 *       - SessionCookie: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 */
// All user management endpoints remain admin-only, just no longer under /admin
router.get('/', requireAdmin, getUsers);
router.get('/:id', requireAdmin, getUser);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);

module.exports = router;
