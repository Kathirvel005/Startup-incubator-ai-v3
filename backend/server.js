const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
require('dotenv').config();

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
    password: hashPassword(password),
    loginCount: 1,
    lastLogin: new Date().toISOString()
  };
  
  db.users.push(newUser);
  writeDB(db);

  const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');
  res.json({ token, user: { id: newUser.id, username: newUser.username, gmail: newUser.gmail, profileIcon: newUser.profileIcon || '', isAdmin: false } });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Admin Login Bypass
  if (username === 'kathirvel_admin' && password === 'Kath@2007') {
    const adminToken = Buffer.from(`admin:${Date.now()}`).toString('base64');
    return res.json({ 
      token: adminToken, 
      user: { id: 'admin', username: 'Kathirvel Admin', gmail: 'kathir24005@gmail.com', profileIcon: '', isAdmin: true } 
    });
  }

  const db = readDB();
  
  const user = db.users.find(u => u.username === username && u.password === hashPassword(password));
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Update login tracking
  user.loginCount = (user.loginCount || 0) + 1;
  user.lastLogin = new Date().toISOString();
  writeDB(db);

  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
  res.json({ token, user: { id: user.id, username: user.username, gmail: user.gmail, profileIcon: user.profileIcon || '', isAdmin: false } });
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

// Admin Dashboard Stats
app.get('/api/admin/dashboard', authenticate, (req, res) => {
  if (req.userId !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const db = readDB();
  
  let totalLogins = 0;
  const enrichedUsers = db.users.map(user => {
    totalLogins += (user.loginCount || 0);
    const userIdeas = db.ideas.filter(idea => idea.userId === user.id);
    return {
      id: user.id,
      username: user.username,
      gmail: user.gmail,
      loginCount: user.loginCount || 0,
      lastLogin: user.lastLogin || null,
      totalTimeSeconds: user.totalTimeSeconds || 0,
      ideasCount: userIdeas.length,
      ideas: userIdeas.map(i => ({
        id: i.id,
        title: i.title,
        platform: i.platform,
        amount: i.amount,
        timestamp: i.timestamp,
        successRate: i.successRate
      }))
    };
  });

  res.json({
    totalVisits: db.stats?.totalVisits || 0,
    totalTimeSeconds: db.stats?.totalTimeSeconds || 0,
    totalUsers: db.users.length,
    totalLogins,
    users: enrichedUsers
  });
});

// Record a site visit
app.post('/api/visit', (req, res) => {
  const db = readDB();
  if (!db.stats) db.stats = { totalVisits: 0, totalTimeSeconds: 0 };
  db.stats.totalVisits += 1;
  writeDB(db);
  res.json({ success: true, totalVisits: db.stats.totalVisits });
});

// Track time spent
app.post('/api/track-time', (req, res) => {
  const { seconds } = req.body;
  if (!seconds || typeof seconds !== 'number') return res.status(400).json({ error: 'Invalid time payload' });
  
  const db = readDB();
  if (!db.stats) db.stats = { totalVisits: 0, totalTimeSeconds: 0 };
  
  // Track global time
  db.stats.totalTimeSeconds = (db.stats.totalTimeSeconds || 0) + seconds;

  // Track per-user time if logged in
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      const [userId] = decoded.split(':');
      if (userId !== 'admin') {
        const user = db.users.find(u => u.id === userId);
        if (user) {
          user.totalTimeSeconds = (user.totalTimeSeconds || 0) + seconds;
        }
      }
    } catch (e) {
      // ignore invalid tokens for time tracking
    }
  }

  writeDB(db);
  res.json({ success: true });
});

// Setup Email Transporter logic
let transporter = null;
let testAccount = null;

// Initialize Ethereal Test Account
nodemailer.createTestAccount().then(account => {
  testAccount = account;
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    }
  });
  console.log("Ethereal test email account created.");
}).catch(console.error);

// Function to generate and send the weekly report
const sendWeeklyReport = async () => {
  try {
    if (!transporter) {
      console.log("Transporter not ready yet.");
      return { success: false, error: "Email service initializing" };
    }
    const db = readDB();
    
    let totalLogins = 0;
    db.users.forEach(u => totalLogins += (u.loginCount || 0));
    
    // Count new ideas this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentIdeas = db.ideas.filter(idea => new Date(idea.timestamp) >= oneWeekAgo);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'kathir24005@gmail.com', // Admin Email
      subject: 'Startup Incubator AI - Weekly Admin Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #8b5cf6;">Startup Incubator AI Weekly Report</h2>
          <p>Here is the automated summary of your platform's activity:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Total Users</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${db.users.length}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Total Website Visits</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${db.stats?.totalVisits || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Total Time Spent (Minutes)</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${Math.floor((db.stats?.totalTimeSeconds || 0) / 60)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>Total Logins</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${totalLogins}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;"><strong>New Ideas Generated (Past 7 Days)</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${recentIdeas.length}</td>
            </tr>
          </table>

          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
            This is an automated message. You can log into your Admin Dashboard for a detailed breakdown.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("Weekly report test email sent successfully. Preview URL: %s", previewUrl);
    return { success: true, previewUrl };

  } catch (error) {
    console.error("Error sending weekly report:", error);
    return { success: false, error: error.message };
  }
};

// Schedule Cron Job (Runs every Sunday at 08:00 AM)
cron.schedule('0 8 * * 0', () => {
  console.log('Running automated weekly report cron job...');
  sendWeeklyReport();
});

// Manual trigger for sending report
app.post('/api/admin/send-report', authenticate, async (req, res) => {
  if (req.userId !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const result = await sendWeeklyReport();
  if (result.success) {
    res.json({ success: true, message: 'Test Report sent successfully!', previewUrl: result.previewUrl });
  } else {
    res.status(500).json({ error: 'Failed to send report. ' + result.error });
  }
});

// Catch-all route to serve React App for non-API requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
