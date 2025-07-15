const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { calculateStreak } = require('../controllers/habitController');
const authMiddleware = require('../middleware/authMiddleware');

// Setup test habit
router.post('/test-setup', async (req, res) => {
  try {
    const { userId, habitId } = req.body;
    
    // Make sure the habit is set to daily type
    await db.execute(
      'UPDATE habits SET type = ? WHERE id = ? AND user_id = ?',
      ['daily', habitId, userId]
    );
    
    res.json({ 
      message: `Test setup complete. Habit ID ${habitId} for User ID ${userId} is now set to daily type.` 
    });
  } catch (error) {
    console.error('Error setting up test:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test streak calculation
router.post('/test-streak', async (req, res) => {
  try {
    const { testCase, userId, habitId } = req.body;
    
    // Get today's date and previous dates
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    let dates = [];
    let expected = 0;
    
    // Set up test data based on test case
    switch (testCase) {
      case '1':
        // Only today
        dates = [formatDate(today)];
        expected = 1;
        break;
      case '2':
        // Today and yesterday
        dates = [formatDate(today), formatDate(yesterday)];
        expected = 2;
        break;
      case '3':
        // Today, yesterday, and 2 days ago
        dates = [formatDate(today), formatDate(yesterday), formatDate(twoDaysAgo)];
        expected = 3;
        break;
      case '4':
        // Yesterday and 2 days ago (no today)
        dates = [formatDate(yesterday), formatDate(twoDaysAgo)];
        expected = 1; // or 2, depending on implementation
        break;
      case '5':
        // Only 2 days ago (broken streak)
        dates = [formatDate(twoDaysAgo)];
        expected = 0;
        break;
      default:
        return res.status(400).json({ error: 'Invalid test case' });
    }
    
    // Clear existing logs for this habit
    await db.execute(
      'DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?',
      [habitId, userId]
    );
    
    // Insert new logs for the specified dates
    for (const date of dates) {
      await db.execute(
        'INSERT INTO habit_logs (habit_id, user_id, completion_date) VALUES (?, ?, ?)',
        [habitId, userId, date]
      );
    }
    
    // Calculate streak
    const streak = await calculateStreak(userId);
    
    res.json({
      testCase,
      dates,
      streak,
      expected
    });
  } catch (error) {
    console.error('Error testing streak:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Route to clear habit logs for a specific habit (for testing)
router.delete('/habit-logs/:habitId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.habitId;
    
    // Delete habit logs for the specified habit
    await db.execute(
      'DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?',
      [habitId, userId]
    );
    
    res.json({ message: 'Habit logs cleared successfully' });
  } catch (error) {
    console.error('Error clearing habit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;