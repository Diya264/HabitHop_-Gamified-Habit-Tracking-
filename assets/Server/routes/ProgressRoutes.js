const express = require('express');
const router = express.Router();
const progressController = require('../controllers/ProgressController');
const authenticate = require('../middleware/authMiddleware');

// Get all progress data (weekly/monthly/yearly) for a user
router.get('/', authenticate, progressController.getUserProgress);

// Add a specific endpoint for weekly data
router.get('/week', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get weekly data
    const [weeklyRows] = await require('../config/db').execute(`
      SELECT DAYNAME(completion_date) as day, COUNT(*) as completed
      FROM habit_logs
      WHERE user_id = ? AND YEARWEEK(completion_date, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY day
    `, [userId]);
    
    // Make sure we have data for all days of the week
    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = allWeekDays.map(day => {
      const found = weeklyRows.find(row => row.day === day);
      return {
        day: day.substring(0, 3), // Abbreviate to 'Sun', 'Mon', etc.
        completed: found ? found.completed : 0
      };
    });
    
    res.json(result);
  } catch (err) {
    console.error("Error fetching weekly progress:", err.message);
    res.status(500).json({ error: "Failed to fetch weekly progress" });
  }
});

module.exports = router;
