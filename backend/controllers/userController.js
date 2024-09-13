const User = require('../models/userModel');

// Fetch leaderboard (top 5 users by high score)
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().sort({ highscore: -1 }).limit(5);
    const leaderboard = users.map(user => ({
      name: user.name,
      highscore: user.highscore
    }));
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leaderboard', error });
  }
};

// Update highscore
const updateHighscore = async (req, res) => {
  const { email, highscore } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.highscore = Math.max(user.highscore, highscore);
    await user.save();

    res.status(200).json({ message: 'Highscore updated', highscore: user.highscore });
  } catch (error) {
    res.status(500).json({ message: 'Error updating highscore', error });
  }
};

module.exports = {
  getLeaderboard,
  updateHighscore
};
