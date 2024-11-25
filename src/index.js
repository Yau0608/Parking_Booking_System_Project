import { createUser, findUserByUsername } from './models/user.js';
import express from 'express';
import session from 'express-session';
import { connectDB } from './dbclient.js';
import loginRouter from './login.js';
import { checkAuth, checkAdmin } from './middleware/auth.js';

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(
  session({
    secret: '21092461d_21106121d_eie4432_final_project',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
  })
);

// Debug log to confirm route registration
console.log('Registering login routes...');
app.use('/api', loginRouter);
console.log('Login routes registered');

// Serve static files with authentication
app.get('/normal.html', checkAuth, (req, res, next) => {
  res.sendFile('normal.html', { root: './static' });
});

app.get('/admin.html', checkAdmin, (req, res, next) => {
  res.sendFile('admin.html', { root: './static' });
});

// Public routes (no auth needed)
app.get('/login.html', (req, res) => {
  res.sendFile('login.html', { root: './static' });
});

app.get('/admin_login.html', (req, res) => {
  res.sendFile('admin_login.html', { root: './static' });
});

app.get('/register.html', (req, res) => {
  res.sendFile('register.html', { root: './static' });
});

// Serve other static files
app.use(express.static('static'));

// Add a test route to verify API routing is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Test route to add a user
app.post('/api/test/user', async (req, res) => {
  try {
    const testUser = {
      username: 'testuser',
      password: 'password123',
      email: 'test@example.com',
      nickname: 'Test User',
      gender: 'male',
      birthdate: '2000-01-01'
    };

    const result = await createUser(testUser);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    // Check if username already exists
    const existingUser = await findUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const result = await createUser(req.body);

    // Set up session for newly registered user
    req.session.logged = true;
    req.session.username = req.body.username;
    req.session.role = 'user';

    res.json({
      success: true,
      message: 'Registration successful',
      username: req.body.username
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.redirect('/login.html');
});



const PORT = 8080;
async function startServer() {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Started at:', new Date().toLocaleString());
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();