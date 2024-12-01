import session from 'express-session';

export const checkAuth = (req, res, next) => {
  if (!req.session.logged) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    return res.redirect('/login.html');
  }
  next();
};

export const checkAdmin = (req, res, next) => {
  console.log('Session:', req.session);
  if (!req.session.logged || req.session.role !== 'admin') {
    console.log('Admin check failed:', {
      logged: req.session.logged,
      role: req.session.role
    });
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required'
    });
  }
  next();
};