const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const authenticate = require('../middleware/authMiddleware'); // assuming you have this
const db = require('../config/db');

// Get all badges
router.get('/all', badgeController.getAllBadges);

// Get user's earned badges
router.get('/my', authenticate, badgeController.getUserBadges);

// Get all badges with user's unlocked status
router.get('/user/:userId', badgeController.getAllBadgesWithUserStatus);

// Check for newly earned badges based on user's actions
router.get('/check/:userId', badgeController.checkForNewBadges);

// Award a random motivation badge
router.post('/random/:userId', badgeController.awardRandomMotivationBadge);

// Manually award a specific badge
router.post('/award/:userId/:badgeId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const badgeId = parseInt(req.params.badgeId);
    
    console.log(`🏆 Manually awarding badge ${badgeId} to user ${userId}`);
    
    // Check if the badge exists
    const [badgeRows] = await db.query(
      'SELECT * FROM badges WHERE id = ?',
      [badgeId]
    );
    
    if (badgeRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: `No badge found with ID ${badgeId}` 
      });
    }
    
    // Check if the user already has this badge
    const [userBadgeRows] = await db.query(
      'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badgeId]
    );
    
    if (userBadgeRows.length > 0) {
      return res.status(200).json({ 
        success: false,
        message: `User already has badge ${badgeId}` 
      });
    }
    
    // Award the badge
    await db.query(
      'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())',
      [userId, badgeId]
    );
    
    console.log(`✅ Badge ${badgeId} successfully awarded to user ${userId}`);
    
    res.status(200).json({ 
      success: true,
      message: `Badge ${badgeId} awarded to user ${userId}`,
      badge: badgeRows[0]
    });
  } catch (error) {
    console.error(`❌ Error awarding badge:`, error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Test endpoint to force badge check (for debugging)
router.get('/test-check/:userId', (req, res) => {
  console.log(`🧪 Test badge check endpoint called for user ${req.params.userId}`);
  badgeController.checkForNewBadges(req, res);
});

// Test endpoint to check consecutive habits count
router.get('/test-consecutive/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`🧪 Test consecutive habits endpoint called for user ${userId}`);
    
    const { countHabitsInRow } = require('../utils/badgeUtils');
    const count = await countHabitsInRow(userId);
    
    res.status(200).json({ 
      userId, 
      consecutiveHabits: count,
      message: `User has ${count} consecutive habits completed`
    });
  } catch (error) {
    console.error(`❌ Error in test-consecutive endpoint:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to debug a specific badge
router.get('/test-debug/:userId/:condition', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const condition = req.params.condition;
    console.log(`🧪 Test debug badge endpoint called for user ${userId} and condition "${condition}"`);
    
    // 1. Check if the badge exists
    const [badgeRows] = await db.query(
      'SELECT * FROM badges WHERE badge_condition = ?',
      [condition]
    );
    
    if (badgeRows.length === 0) {
      return res.status(404).json({ 
        error: `No badge found with condition "${condition}"` 
      });
    }
    
    const badge = badgeRows[0];
    console.log(`🏆 Found badge:`, badge);
    
    // 2. Check if the user already has this badge
    const [userBadgeRows] = await db.query(
      'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badge.id]
    );
    
    const alreadyEarned = userBadgeRows.length > 0;
    console.log(`🔍 User already earned this badge: ${alreadyEarned}`);
    
    // 3. Check the condition value
    let conditionValue = 0;
    
    if (condition === 'habit_10_row') {
      const { countHabitsInRow } = require('../utils/badgeUtils');
      conditionValue = await countHabitsInRow(userId);
    }
    
    console.log(`📊 Condition value for "${condition}": ${conditionValue}`);
    
    // 4. Return the debug info
    res.status(200).json({
      badge,
      alreadyEarned,
      conditionValue,
      shouldEarn: conditionValue >= 10 && !alreadyEarned
    });
  } catch (error) {
    console.error(`❌ Error in test-debug endpoint:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to view all badge conditions
router.get('/test-conditions', async (req, res) => {
  try {
    console.log(`🧪 Test badge conditions endpoint called`);
    
    // Get badges directly with proper SQL syntax
    const [badges] = await db.query('SELECT id, name, badge_condition, description FROM badges');
    console.log(`🏆 Found ${badges.length} badges in the database`);
    
    // Group badges by condition type
    const conditionGroups = {};
    const conditionPatterns = {};
    
    badges.forEach(badge => {
      const condition = badge.badge_condition || '';
      
      // Skip if condition is empty
      if (!condition) {
        if (!conditionGroups['unknown']) {
          conditionGroups['unknown'] = [];
        }
        conditionGroups['unknown'].push({
          id: badge.id,
          name: badge.name,
          condition: 'undefined',
          description: badge.description
        });
        return;
      }
      
      const conditionParts = condition.split('_');
      const conditionType = conditionParts[0];
      
      // Analyze the condition pattern
      let pattern = 'unknown';
      
      if (condition === 'first_habit') {
        pattern = 'first_habit';
      } else if (conditionParts[0] === 'streak' && !isNaN(parseInt(conditionParts[1]))) {
        pattern = 'streak_X_days';
      } else if (conditionParts[0] === 'complete' && !isNaN(parseInt(conditionParts[1]))) {
        pattern = 'complete_X';
      } else if (conditionParts[0] === 'weekly' && !isNaN(parseInt(conditionParts[1]))) {
        pattern = 'weekly_X';
      } else if (conditionParts[0] === 'habit' && !isNaN(parseInt(conditionParts[1])) && conditionParts[2] === 'row') {
        pattern = 'habit_X_row';
      } else if (condition === 'random_motivation') {
        pattern = 'random_motivation';
      } else if (condition.includes('streak') && condition.match(/\d+/)) {
        pattern = 'streak_related';
      } else if (condition.includes('complet') && condition.match(/\d+/)) {
        pattern = 'completion_related';
      } else if (condition.includes('week') && condition.match(/\d+/)) {
        pattern = 'weekly_related';
      } else if ((condition.includes('row') || condition.includes('consecutive')) && condition.match(/\d+/)) {
        pattern = 'consecutive_related';
      }
      
      if (!conditionPatterns[pattern]) {
        conditionPatterns[pattern] = [];
      }
      conditionPatterns[pattern].push(condition);
      
      if (!conditionGroups[conditionType]) {
        conditionGroups[conditionType] = [];
      }
      
      conditionGroups[conditionType].push({
        id: badge.id,
        name: badge.name,
        condition: badge.badge_condition,
        description: badge.description,
        pattern: pattern
      });
    });
    
    res.status(200).json({ 
      totalBadges: badges.length,
      conditionGroups,
      conditionPatterns,
      supportStatus: {
        message: "All badge conditions are supported by the current implementation",
        supportedPatterns: [
          'first_habit',
          'streak_X_days',
          'complete_X',
          'weekly_X',
          'habit_X_row',
          'random_motivation',
          'streak_related',
          'completion_related',
          'weekly_related',
          'consecutive_related'
        ]
      }
    });
  } catch (error) {
    console.error(`❌ Error in test-conditions endpoint:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to check all badge conditions for a user
router.get('/test-all-conditions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(`🧪 Test all badge conditions endpoint called for user ${userId}`);
    
    // Get all badges
    const [badges] = await db.query('SELECT id, name, badge_condition, description FROM badges');
    console.log(`🏆 Found ${badges.length} badges in the database`);
    
    // Get user's already earned badges
    const [userBadges] = await db.query(
      'SELECT badge_id FROM user_badges WHERE user_id = ?',
      [userId]
    );
    const earnedBadgeIds = userBadges.map(row => row.badge_id);
    console.log(`🏅 User ${userId} has already earned ${earnedBadgeIds.length} badges`);
    
    // Get user metrics
    const { calculateMaxStreak, countHabitsInRow } = require('../utils/badgeUtils');
    
    // Get total habit completions
    const [completionData] = await db.query(
      `SELECT COUNT(*) AS totalCompletions 
       FROM habit_logs 
       WHERE user_id = ? AND completion_date IS NOT NULL`,
      [userId]
    );
    const totalCompletions = completionData[0].totalCompletions || 0;
    
    // Get max streak
    const maxStreak = await calculateMaxStreak(userId);
    
    // Get weekly completions (last 7 days)
    const [weeklyData] = await db.query(
      `SELECT COUNT(*) AS weeklyCompletions 
       FROM habit_logs 
       WHERE user_id = ? 
       AND completion_date IS NOT NULL 
       AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );
    const weeklyCompletions = weeklyData[0].weeklyCompletions || 0;
    
    // Get consecutive habits completed
    const consecutiveHabits = await countHabitsInRow(userId);
    
    // User metrics summary
    const userMetrics = {
      totalCompletions,
      maxStreak,
      weeklyCompletions,
      consecutiveHabits
    };
    
    // Check each badge
    const badgeStatus = [];
    
    for (const badge of badges) {
      // Skip if badge has no condition
      if (!badge.badge_condition) continue;
      
      const condition = badge.badge_condition;
      const conditionParts = condition.split('_');
      let meetsCondition = false;
      let conditionValue = 0;
      let threshold = 0;
      let metric = '';
      
      // First habit completion
      if (condition === 'first_habit') {
        meetsCondition = totalCompletions >= 1;
        conditionValue = totalCompletions;
        threshold = 1;
        metric = 'totalCompletions';
      }
      // Handle streak conditions
      else if (conditionParts[0] === 'streak' && !isNaN(parseInt(conditionParts[1]))) {
        threshold = parseInt(conditionParts[1]);
        meetsCondition = maxStreak >= threshold;
        conditionValue = maxStreak;
        metric = 'maxStreak';
      }
      // Handle completion conditions
      else if (conditionParts[0] === 'complete' && !isNaN(parseInt(conditionParts[1]))) {
        threshold = parseInt(conditionParts[1]);
        meetsCondition = totalCompletions >= threshold;
        conditionValue = totalCompletions;
        metric = 'totalCompletions';
      }
      // Handle weekly completion conditions
      else if (conditionParts[0] === 'weekly' && !isNaN(parseInt(conditionParts[1]))) {
        threshold = parseInt(conditionParts[1]);
        meetsCondition = weeklyCompletions >= threshold;
        conditionValue = weeklyCompletions;
        metric = 'weeklyCompletions';
      }
      // Handle consecutive habits conditions
      else if (conditionParts[0] === 'habit' && !isNaN(parseInt(conditionParts[1])) && conditionParts[2] === 'row') {
        threshold = parseInt(conditionParts[1]);
        meetsCondition = consecutiveHabits >= threshold;
        conditionValue = consecutiveHabits;
        metric = 'consecutiveHabits';
      }
      // Random motivation badges
      else if (condition === 'random_motivation') {
        meetsCondition = false;
        conditionValue = 0;
        threshold = 'N/A';
        metric = 'random';
      }
      // Try to infer other conditions
      else {
        const numbers = condition.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          threshold = parseInt(numbers[0]);
          
          if (condition.includes('streak')) {
            meetsCondition = maxStreak >= threshold;
            conditionValue = maxStreak;
            metric = 'maxStreak';
          } 
          else if (condition.includes('complet') || condition.includes('finish') || condition.includes('done')) {
            meetsCondition = totalCompletions >= threshold;
            conditionValue = totalCompletions;
            metric = 'totalCompletions';
          } 
          else if (condition.includes('week') || condition.includes('day') || condition.includes('daily')) {
            meetsCondition = weeklyCompletions >= threshold;
            conditionValue = weeklyCompletions;
            metric = 'weeklyCompletions';
          } 
          else if (condition.includes('row') || condition.includes('consecutive') || condition.includes('sequence')) {
            meetsCondition = consecutiveHabits >= threshold;
            conditionValue = consecutiveHabits;
            metric = 'consecutiveHabits';
          }
          else {
            // Try all metrics
            if (maxStreak >= threshold) {
              meetsCondition = true;
              conditionValue = maxStreak;
              metric = 'maxStreak';
            }
            else if (totalCompletions >= threshold) {
              meetsCondition = true;
              conditionValue = totalCompletions;
              metric = 'totalCompletions';
            }
            else if (weeklyCompletions >= threshold) {
              meetsCondition = true;
              conditionValue = weeklyCompletions;
              metric = 'weeklyCompletions';
            }
            else if (consecutiveHabits >= threshold) {
              meetsCondition = true;
              conditionValue = consecutiveHabits;
              metric = 'consecutiveHabits';
            }
            else {
              meetsCondition = false;
              conditionValue = Math.max(maxStreak, totalCompletions, weeklyCompletions, consecutiveHabits);
              metric = 'bestMetric';
            }
          }
        }
        else {
          // Handle conditions without numbers
          if (condition.includes('first') || condition.includes('start')) {
            meetsCondition = totalCompletions >= 1;
            conditionValue = totalCompletions;
            threshold = 1;
            metric = 'totalCompletions';
          }
          else if (condition.includes('week') || condition.includes('daily')) {
            meetsCondition = weeklyCompletions >= 1;
            conditionValue = weeklyCompletions;
            threshold = 1;
            metric = 'weeklyCompletions';
          }
          else if (condition.includes('streak')) {
            meetsCondition = maxStreak >= 2;
            conditionValue = maxStreak;
            threshold = 2;
            metric = 'maxStreak';
          }
          else {
            meetsCondition = false;
            conditionValue = 0;
            threshold = 'unknown';
            metric = 'unknown';
          }
        }
      }
      
      badgeStatus.push({
        id: badge.id,
        name: badge.name,
        condition: badge.badge_condition,
        description: badge.description,
        earned: earnedBadgeIds.includes(badge.id),
        meetsCondition,
        conditionValue,
        threshold,
        metric,
        shouldEarn: meetsCondition && !earnedBadgeIds.includes(badge.id)
      });
    }
    
    // Group badges by status
    const earnedBadges = badgeStatus.filter(b => b.earned);
    const readyToEarn = badgeStatus.filter(b => b.shouldEarn);
    const inProgress = badgeStatus.filter(b => !b.earned && !b.shouldEarn);
    
    res.status(200).json({
      userId,
      userMetrics,
      badgeSummary: {
        total: badges.length,
        earned: earnedBadges.length,
        readyToEarn: readyToEarn.length,
        inProgress: inProgress.length
      },
      earnedBadges,
      readyToEarn,
      inProgress
    });
  } catch (error) {
    console.error(`❌ Error in test-all-conditions endpoint:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
