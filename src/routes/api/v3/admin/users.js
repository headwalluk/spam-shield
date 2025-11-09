const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} = require('../../../../controllers/userController');

/**
 * @swagger
 * /api/v3/admin/users:
 *   get:
 *     summary: List users
 *     description: Returns a paginated list of users. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/EmailFilterParam'
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersPage'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 */
router.get('/', getUsers);

/**
 * @swagger
 * /api/v3/admin/users/{id}:
 *   get:
 *     summary: Get a single user
 *     description: Returns a single user by ID, including their assigned roles. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: A single user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 *       404:
 *         description: User not found
 */
router.get('/:id', getUser);

/**
 * @swagger
 * /api/v3/admin/users:
 *   post:
 *     summary: Create a user
 *     description: Creates a new user with a server-generated password. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateRequest'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 */
router.post('/', createUser);

/**
 * @swagger
 * /api/v3/admin/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Updates fields for a user. Currently supports updating email. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateRequest'
 *     responses:
 *       204:
 *         description: Updated successfully (no content)
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 *       404:
 *         description: User not found
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /api/v3/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Requires admin privileges.
 *     tags: [Admin]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       204:
 *         description: Deleted successfully (no content)
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (not an administrator)
 *       404:
 *         description: User not found
 */
router.delete('/:id', deleteUser);

module.exports = router;
