import { createUser, findUserByUsername } from './models/user.js';
import express from 'express';
import session from 'express-session';
import { connectDB } from './dbclient.js';
import loginRouter from './login.js';
import { checkAuth, checkAdmin } from './middleware/auth.js';
import { upload } from './middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { processImage } from './middleware/imageProcess.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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


// Then your API router
app.use('/api', loginRouter);

// Registration endpoint
app.post('/api/register', upload.single('profileImage'), async (req, res) => {
  try {
    // Check if username already exists
    const existingUser = await findUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    let processedImageData = null;
    if (req.file) {
      const processedBuffer = await processImage(req.file.buffer);
      processedImageData = {
        data: processedBuffer,
        contentType: 'image/jpeg' // We're converting everything to JPEG
      };
    }

    // Create user data object with processed image
    const userData = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      nickname: req.body.nickname,
      gender: req.body.gender,
      birthdate: req.body.birthdate,
      profileImage: processedImageData
    };

    // Create new user
    const result = await createUser(userData);

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

// Profile image endpoint
app.get('/api/profile-image/:username', async (req, res) => {
  try {
    const user = await findUserByUsername(req.params.username);
    if (user && user.profileImage) {
      res.set('Content-Type', user.profileImage.contentType);
      res.send(user.profileImage.data.buffer);
    } else {
      res.status(404).send('Image not found');
    }
  } catch (error) {
    res.status(500).send('Error retrieving image');
  }
});

// Protected routes
app.get('/normal.html', checkAuth, (req, res, next) => {
  res.sendFile('normal.html', { root: './static' });
});

app.get('/admin.html', checkAdmin, (req, res, next) => {
  res.sendFile('admin.html', { root: './static' });
});

// Public HTML routes
app.get('/login.html', (req, res) => {
  res.sendFile('login.html', { root: './static' });
});

app.get('/admin_login.html', (req, res) => {
  res.sendFile('admin_login.html', { root: './static' });
});

app.get('/register.html', (req, res) => {
  res.sendFile('register.html', { root: './static' });
});

// Static files middleware should be last
app.use(express.static('static'));

// Root redirect
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