import { createUser, findUserByUsername, updateUserProfile, updateUserPassword, validatePassword } from './models/user.js';
import { comparePassword, hashPassword } from './utils/password.js';
import { client, connectDB } from './dbclient.js';
import express from 'express';
import session from 'express-session';
import loginRouter from './login.js';
import { checkAuth, checkAdmin } from './middleware/auth.js';
import { upload } from './middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { processImage } from './middleware/imageProcess.js';
import parkingRouter from './routes/parking.js';
import bodyParser from 'body-parser';
import eventsRouter from './routes/events.js';
import paymentRouter from './routes/payment.js';
import { initializeParkingSpaces, resetParkingSpaces } from './models/parking.js';

const db = client.db("parkingSystem");
const users = db.collection("users");
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
app.use('/api', parkingRouter);
app.use('/api', eventsRouter);
app.use('/api', paymentRouter);

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

app.get('/account.html', checkAuth, (req, res, next) => {
  res.sendFile('account.html', { root: './static' });
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

// Create an admin router
const adminRouter = express.Router();

// Admin routes
adminRouter.get('/check-session', checkAdmin, (req, res) => {
  res.json({
    success: true,
    session: {
      logged: req.session.logged,
      role: req.session.role,
      username: req.session.username
    }
  });
});

adminRouter.get('/users', checkAdmin, async (req, res) => {
  try {
    const usersList = await users.find({}).toArray();
    console.log('Found users:', usersList);
    const sanitizedUsers = usersList.map(user => ({
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      createdAt: user.createdAt,
      status: user.status || 'active'
    }));

    res.json({
      success: true,
      data: sanitizedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      data: []
    });
  }
});

adminRouter.post('/users/:username/status', checkAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const result = await users.updateOne(
      { username: req.params.username },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user status' });
  }
});

adminRouter.post('/users/:username/reset-password', checkAdmin, async (req, res) => {
  try {
    // Generate a temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(temporaryPassword);

    const result = await users.updateOne(
      { username: req.params.username },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, temporaryPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

adminRouter.get('/users/:username/details', checkAdmin, async (req, res) => {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add default status if not set
    user.status = user.status || 'active';

    delete user.password; // Remove sensitive information
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user details' });
  }
});

// Mount the admin router
app.use('/api/admin', adminRouter);

// Serve static files
app.use(express.static(path.join(__dirname, '../static')));
app.use('/static', express.static(path.join(__dirname, '../static')));

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Profile routes
app.get('/api/profile', checkAuth, async (req, res) => {
  try {
    const user = await findUserByUsername(req.session.username);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Remove sensitive information
    delete user.password;
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/profile/update', checkAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const updates = {
      nickname: req.body.nickname,
      email: req.body.email,
      gender: req.body.gender,
      birthdate: req.body.birthdate
    };

    if (req.file) {
      const processedImage = await processImage(req.file.buffer);
      updates.profileImage = {
        data: processedImage,
        contentType: 'image/jpeg'
      };
    }

    const result = await updateUserProfile(req.session.username, updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/profile/change-password', checkAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Add password validation
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long and contain uppercase, lowercase, and numbers'
      });
    }

    const user = await findUserByUsername(req.session.username);
    const isValidPassword = await comparePassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await updateUserPassword(req.session.username, hashedPassword);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = 8080;
async function startServer() {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to database. Server will not start.');
      process.exit(1);
    }

    // Initialize parking spaces
    console.log('Initializing parking system...');
    await initializeParkingSpaces();
    console.log('Parking system initialized');

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