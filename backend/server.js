const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const dbPath = path.join(__dirname, 'data', 'db.json');

// Helper to read DB
const readDB = () => {
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Hash password
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Register
app.post('/api/register', (req, res) => {
  const { username, gmail, password } = req.body;
  const db = readDB();
  
  if (db.users.find(u => u.username === username || u.gmail === gmail)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    username,
    gmail,
    password: hashPassword(password)
  };
  
  db.users.push(newUser);
  writeDB(db);

  const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');
  res.json({ token, user: { id: newUser.id, username: newUser.username, gmail: newUser.gmail, profileIcon: newUser.profileIcon || '' } });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  
  const user = db.users.find(u => u.username === username && u.password === hashPassword(password));
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  res.json({ token, user: { id: user.id, username: user.username, gmail: user.gmail, profileIcon: user.profileIcon || '' } });
});

// Middleware for Auth
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [userId] = decoded.split(':');
    req.userId = userId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Update Profile
app.put('/api/profile', authenticate, (req, res) => {
  const { username, gmail, profileIcon } = req.body;
  const db = readDB();
  
  const userIndex = db.users.findIndex(u => u.id === req.userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update fields
  if (username) db.users[userIndex].username = username;
  if (gmail) db.users[userIndex].gmail = gmail;
  if (profileIcon !== undefined) db.users[userIndex].profileIcon = profileIcon;

  writeDB(db);

  const updatedUser = db.users[userIndex];
  res.json({ user: { id: updatedUser.id, username: updatedUser.username, gmail: updatedUser.gmail, profileIcon: updatedUser.profileIcon || '' } });
});

// Get History
app.get('/api/ideas/history', authenticate, (req, res) => {
  const db = readDB();
  const history = db.ideas.filter(idea => idea.userId === req.userId);
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(history);
});

// Submit Idea
app.post('/api/ideas', authenticate, (req, res) => {
  const { title, explanation, amount, platform } = req.body;
  const db = readDB();
  
  const newIdea = {
    id: `idea_${Math.random().toString(36).substr(2, 9)}`,
    userId: req.userId,
    title,
    explanation,
    amount,
    platform,
    successRate: Math.floor(Math.random() * 40) + 50, // Mock 50-90
    riskRate: Math.floor(Math.random() * 40) + 10,
    innovationScore: Math.floor(Math.random() * 30) + 70,
    requiredAmount: amount * 1.5,
    remainingAmount: (amount * 1.5) - amount,
    isBudgetSufficient: amount >= (amount * 1.5),
    recommendations: [
      "Conduct thorough market research.",
      "Build a minimum viable product (MVP) first.",
      "Seek feedback from potential early adopters."
    ],
    projectedSuccessRate: Math.floor(Math.random() * 40) + 60,
    steps: [
      {
        phase: "Phase 1: Concept & Validation",
        duration: "Weeks 1-4",
        tasks: ["Competitor analysis", "UI design", "User interviews"]
      }
    ],
    similarStartup: {
      name: "Mock Startup",
      successRate: 85,
      industry: platform
    },
    timestamp: new Date().toISOString()
  };
  
  db.ideas.push(newIdea);
  writeDB(db);
  
  res.json(newIdea);
});

// Delete Idea
app.delete('/api/ideas/:id', authenticate, (req, res) => {
  const db = readDB();
  const index = db.ideas.findIndex(idea => idea.id === req.params.id && idea.userId === req.userId);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Idea not found' });
  }
  
  db.ideas.splice(index, 1);
  writeDB(db);
  
  res.json({ success: true });
});

// Catch-all route to serve React App for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
