const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticate = require('../middleware/authMiddleware');

// Get weekly progress data
router.get('/', authenticate, async (req, res) => {
  console.log('📊 Weekly progress endpoint hit for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    
    // Get weekly data - count completed habits by day of week
    const [weeklyRows] = await db.execute(`
      SELECT 
        DAYNAME(completion_date) as day, 
        COUNT(*) as completed
      FROM 
        habit_logs
      WHERE 
        user_id = ? 
        AND completion_date IS NOT NULL
        AND YEARWEEK(completion_date, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY 
        day
    `, [userId]);
    
    console.log('📊 Raw weekly data:', JSON.stringify(weeklyRows));
    
    // Make sure we have data for all days of the week with abbreviated names
    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = allWeekDays.map(day => {
      const found = weeklyRows.find(row => row.day === day);
      return {
        day: day.substring(0, 3), // Abbreviate to 'Sun', 'Mon', etc.
        completed: found ? found.completed : 0
      };
    });
    
    console.log('📊 Processed weekly data:', JSON.stringify(result));
    res.json(result);
  } catch (err) {
    console.error('❌ Error fetching weekly progress:', err);
    res.status(500).json({ error: 'Failed to fetch weekly progress' });
  }
});

module.exports = router;