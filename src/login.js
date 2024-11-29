import express from 'express';
import { findUserByUsername } from './models/user.js';
import { checkAuth, checkAdmin } from './middleware/auth.js';
import { comparePassword } from './utils/password.js';
const router = express.Router();

// Basic login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Admin check remains the same
    if (username === 'admin' && password === 'adminpass') {
      req.session.logged = true;
      req.session.username = username;
      req.session.role = 'admin';
      return res.json({ success: true });
    }

    // Regular user authentication
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Add status check here
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact an administrator.'
      });
    }

    // Compare password with stored hash
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    req.session.logged = true;
    req.session.username = username;
    req.session.role = user.role;

    res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
    res.json({ success: true });
  });
});

// Protected API routes
router.get('/user/profile', checkAuth, (req, res) => {
  // User profile data
});

router.get('/admin/dashboard', checkAdmin, (req, res) => {
  // Admin dashboard data
});

export default router;
