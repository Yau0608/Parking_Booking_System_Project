import express from 'express';
import { client } from './dbclient.js';
const router = express.Router();

// Get current user info
router.get('/user/current', (req, res) => {
  if (req.session.logged && req.session.username) {
    res.json({
      username: req.session.username,
      isAdmin: req.session.isAdmin || false
    });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// Login route
router.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt:', { username, password });

  try {
    // Check for admin login
    if (username === 'admin' && password === 'adminpass') {
      req.session.logged = true;
      req.session.username = username;
      req.session.isAdmin = true;
      return res.json({ success: true, isAdmin: true });
    }

    // Regular user login
    const db = client.db('parkingSystem');
    const user = await db.collection('users').findOne({ username });
    console.log('Found user:', user);

    if (!user || user.password !== password) {
      console.log('Login failed: Invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Set session data
    req.session.logged = true;
    req.session.username = username;
    req.session.isAdmin = false;

    res.json({ success: true, isAdmin: false });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.json({ success: true });
  });
});

// Authentication middleware
export const requireLogin = (req, res, next) => {
  if (!req.session.logged) {
    return res.redirect('/login.html');
  }
  next();
};

export default router;
