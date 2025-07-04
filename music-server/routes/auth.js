const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, createUser, getUserByUsername, getUserById } = require('../db/db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // put this in .env

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const existing = getUserByUsername(username);
  if (existing) return res.status(409).json({ error: 'Username taken' });

  const hash = await bcrypt.hash(password, 10);
  const userId = createUser(username, email, hash); // Make sure your DB helper accepts email

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, userId });
});


// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = getUserByUsername(username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, userId: user.id });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.userId = decoded.userId;
    next();
  });
}


// Protected route
router.get('/me', authenticateToken, (req, res) => {
  const user = getUserById(req.userId); // Your implementation
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
});


module.exports = {
  router,
  authenticateToken
};
