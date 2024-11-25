import express from 'express';
import { findUserByUsername } from './models/user.js';
import { checkAuth, checkAdmin } from './middleware/auth.js';
const router = express.Router();

// Basic login route
router.post('/login', async (req, res) => {
  console.log('Login route hit:', req.body);
  const { username, password } = req.body;

  try {
    // Check for admin credentials, admin username and password are hardcoded
    if (username === 'admin' && password === 'adminpass') {
      req.session.logged = true;
      req.session.username = username;
      req.session.role = 'admin';
      return res.json({ success: true });
    }

    // Regular user authentication
    const user = await findUserByUsername(username);
    console.log('Found user:', user);

    if (!user || user.password !== password) {
      console.log('Login failed: Invalid credentials');
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
