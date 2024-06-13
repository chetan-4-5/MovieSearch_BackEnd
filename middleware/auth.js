const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('x-auth-token');
    console.log('Auth Middleware: Token:', token);

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        console.log('JWT Secret:', secret);  // Verify the secret is being read

        const decoded = jwt.verify(token, secret);
        console.log('Decoded Token:', decoded);

        // Find the user by ID from the token payload
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ msg: 'User not found' });
        }

        // Attach user object to the request for further use in route handlers
        req.user = user;
        next();  // Move to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token has expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
