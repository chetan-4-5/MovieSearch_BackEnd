// routes/userRoutes.js
const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', authUser);
// GET current user
router.get('/user', authMiddleware, async (req, res) => {
    try {
        // Fetch user data based on authenticated user (req.user.id)
        const user = await User.findById(req.user.id); // Assuming User is your user model
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Exclude sensitive information like password before sending the user object
        const userToSend = {
            id: user.id,
            username: user.username,
            email: user.email
            // Add other fields you want to send
        };
        res.json(userToSend); // Return user data
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
