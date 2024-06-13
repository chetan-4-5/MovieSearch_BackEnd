// routes/userRoutes.js
const express = require('express');
const { registerUser, authUser } = require('../controllers/userController');
const router = express.Router();
const { getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/user', protect, getUserById);
module.exports = router;
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
exports.getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json({ user });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

router.post('/register', registerUser);
router.post('/login', authUser);

module.exports = router;
