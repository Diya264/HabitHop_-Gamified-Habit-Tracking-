const db = require("../config/db");

// Helper to get all completed daily habits for today
const getTodayCompletions = async (userId) => {
  const today = new Date().toISOString().split("T")[0];
  console.log(`🔍 Getting today's completions for user ${userId} on date ${today}`);

  // First, let's check all habit logs for today
  const [allLogs] = await db.execute(
    `SELECT hl.*, h.name, h.type FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.id
     WHERE hl.user_id = ? AND hl.completion_date = ?`,
    [userId, today]
  );
  
  console.log(`🔍 Found ${allLogs.length} total habit logs for today:`, 
    allLogs.map(log => `${log.name} (${log.type})`));

  // Now get only the daily habits
  const [rows] = await db.execute(
    `SELECT hl.*, h.name, h.type FROM habit_logs hl
     JOIN habits h ON hl.habit_id = h.id
     WHERE hl.user_id = ? AND h.type = 'daily' AND hl.completion_date = ?`,
    [userId, today]
  );
  
  console.log(`🔍 Found ${rows.length} daily habit completions for today:`, 
    rows.map(row => row.name));

  return rows;
};

// Helper to check if habits were missed yesterday
const missedYesterday = async (userId) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yDate = yesterday.toISOString().split("T")[0];

  const [rows] = await db.execute(
    `SELECT * FROM habits h
     LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND DATE(hl.completion_date) = ?
     WHERE h.user_id = ? AND h.type = 'daily'`,
    [yDate, userId]
  );

  const missed = rows.filter((row) => row.completion_date == null);
  return missed.length > 0;
};

// Define streak calculation function directly in this file to avoid circular dependencies
const calculateStreak = async (userId) => {
  try {
    // Get all distinct completion dates for this user
    const [rows] = await db.execute(
      "SELECT DISTINCT DATE(hl.completion_date) AS completed_day " +
      "FROM habit_logs hl " +
      "WHERE hl.user_id = ? " +
      "AND hl.completion_date IS NOT NULL " +
      "ORDER BY completed_day DESC",
      [userId]
    );
    
    if (rows.length === 0) {
      return 0;
    }

    // Start with a streak of 1 for the most recent day
    let streak = 1;
    
    // Get today's date with time set to midnight for proper comparison
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get yesterday's date
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get the most recent completion date
    let mostRecentDate = new Date(rows[0].completed_day);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Check if the most recent completion is from today or yesterday
    // If not, the current streak is broken
    if (mostRecentDate.getTime() !== today.getTime() && 
        mostRecentDate.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Start checking from the second most recent day
    let expectedDate = new Date(mostRecentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    
    for (let i = 1; i < rows.length; i++) {
      let completedDate = new Date(rows[i].completed_day);
      completedDate.setHours(0, 0, 0, 0);
      
      // Check if this date is the expected previous day
      if (completedDate.getTime() === expectedDate.getTime()) {
        streak++;
        // Move expected date back by one day
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Streak is broken
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error("Error calculating streak:", error);
    return 0;
  }
};

// Main mood logic
const calculateMood = async (userId) => {
  const completionsToday = await getTodayCompletions(userId);
  const missedYday = await missedYesterday(userId);
  const streak = await calculateStreak(userId);
  
  console.log(`🔍 Calculating mood for user ${userId}:`, {
    completionsToday: completionsToday.length,
    missedYesterday: missedYday,
    streak
  });

  // Super excited if 6+ habits completed today
  if (completionsToday.length >= 6) {
    console.log(`🔥 User ${userId} has ${completionsToday.length} completions today - setting mood to SUPER_HAPPY (excited)`);
    return "super_happy";  // 🤩 - 6+ completions today (super excited)
  }
  
  // If streak is 3 or more, the pet is happy regardless of today's completions
  if (streak >= 3) {
    console.log(`🔥 User ${userId} has a streak of ${streak} days - setting mood to HAPPY`);
    return "happy";     // 😃 - Streak of 3+ days
  }
  
  // Otherwise, use the enhanced logic
  if (completionsToday.length >= 2) {
    console.log(`🔥 User ${userId} has ${completionsToday.length} completions today - setting mood to HAPPY`);
    return "happy";     // 😃 - 2+ completions today
  }
  
  if (completionsToday.length === 1) {
    console.log(`🔥 User ${userId} has 1 completion today - setting mood to CONTENT`);
    return "content";  // 🙂 - 1 completion today
  }
  
  if (streak === 2) {
    console.log(`🔥 User ${userId} has a streak of 2 days - setting mood to CONTENT`);
    return "content";  // 🙂 - Streak of 2 days
  }
  
  if (missedYday) {
    console.log(`🔥 User ${userId} missed habits yesterday - setting mood to SAD`);
    return "sad";        // 😞 - Missed habits yesterday
  }
  
  if (streak === 1) {
    console.log(`🔥 User ${userId} has a streak of 1 day - setting mood to CONTENT`);
    return "content";  // 🙂 - Streak of 1 day
  }
  
  if (completionsToday.length === 0) {
    console.log(`🔥 User ${userId} has no completions today - setting mood to ANGRY`);
    return "angry";    // 😠 - No habits completed today
  }

  console.log(`🔥 User ${userId} has no specific mood condition met - setting mood to NEUTRAL`);
  return "neutral";    // 😐 - Default state
};

module.exports = { calculateMood, calculateStreak, getTodayCompletions };
