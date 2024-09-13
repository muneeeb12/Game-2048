const express = require('express');
const router = express.Router();
const usercontroller = require('../controllers/userController');

// Define routes and associate them with controller functions
router.get('/leaderboard', usercontroller.getLeaderboard);

router.post('/update-score', usercontroller.updateHighscore);

module.exports = router;
