import express from 'express';
const router = express.Router();

// Basic login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // For testing - accept any login
  req.session.logged = true;
  req.session.username = username;
  
  res.json({ success: true });
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

export default router;
