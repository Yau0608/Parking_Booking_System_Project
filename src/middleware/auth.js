import session from 'express-session';

export const checkAuth = (req, res, next) => {
  if (!req.session.logged) {
    return res.redirect('/login.html');
  }
  next();
};

export const checkAdmin = (req, res, next) => {
  if (!req.session.logged || req.session.role !== 'admin') {
    return res.redirect('/login.html');
  }
  next();
}; 