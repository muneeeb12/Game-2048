const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

const usersFile = './users.json';

// Helper function to read users from JSON file
const readUsers = () => {
  const data = fs.readFileSync(usersFile, 'utf-8');
  return JSON.parse(data);
};

// Helper function to write users to JSON file
const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
};

app.get('/leaderboard', (req, res) => {
  try {
    const users = readUsers();
    const sortedUsers = Object.entries(users)
      .map(([username, { highScore }]) => ({ username, highScore }))
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, 5); // Get top 5 users

    res.status(200).json(sortedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error });
  }
});

// Endpoint for registering a user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (users[username]) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  users[username] = { password, highScore: 0 }; // Add new user with initial high score 0
  writeUsers(users);
  return res.status(201).json({ message: 'User registered successfully' });
});

// Endpoint for logging in
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  return res.status(200).json({ username, highScore: users[username].highScore });
});

// Endpoint for updating high score
app.post('/update-score', (req, res) => {
    console.log('Received request:', req.body);
    try {
      const { username, highScore } = req.body;
      const users = readUsers();
  
      if (!users[username]) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      users[username].highScore = Math.max(users[username].highScore, highScore); // Update if the new score is higher
      writeUsers(users);
      return res.status(200).json({ message: 'High score updated', highScore: users[username].highScore });
    } catch (error) {
      console.error('Error in /update-score endpoint:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
});
  
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
