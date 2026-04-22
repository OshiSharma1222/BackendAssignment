const express = require('express');
const { listUsers, updateUserRole, deleteUser } = require('../../controllers/user.controller');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('ADMIN'));

/**
 * @openapi
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (admin only)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Users list }
 *       403: { description: Forbidden }
 */
router.get('/', listUsers);

/**
 * @openapi
 * /api/v1/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Change a user's role (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string, enum: [USER, ADMIN] }
 *     responses:
 *       200: { description: Updated user }
 */
router.patch('/:id/role', updateUserRole);

/**
 * @openapi
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user (admin only)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Deleted }
 */
router.delete('/:id', deleteUser);

module.exports = router;
