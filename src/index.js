import { createUser } from './models/User.js';
import express from 'express';
import session from 'express-session';
import { connectDB } from './dbclient.js';

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

app.use(express.static('static'));
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