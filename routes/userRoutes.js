const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Authentication token
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       401:
 *         description: Invalid token
 */
router.delete('/:id', authMiddleware.verifyToken, userController.deleteUser);

module.exports = router;
