const db = require("../config/db");
const { checkAndAwardBadges } = require("../utils/badgeUtils");

const markHabitComplete = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  const { completed } = req.body;
  const { calculateMood } = require("../utils/moodUtils");

  console.log("🔹 Received request:", { id, userId, completed });

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // ✅ Check if the habit exists
    const [habit] = await db.execute("SELECT * FROM habits WHERE id = ? AND user_id = ?", [id, userId]);

    if (habit.length === 0) {
      return res.status(404).json({ message: "Habit not found!" });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    console.log(`🔹 Today's date: ${today}`);

    if (habit[0].type === "one-time") {
      const [existingLog] = await db.execute(
        "SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? AND completion_date IS NOT NULL",
        [id, userId]
      );

      if (existingLog.length > 0) {
        return res.status(400).json({ message: "One-time habit already completed!" });
      }
    } else if (habit[0].type === "daily") {
      // For daily habits, check if there's already a log for today
      const [existingTodayLog] = await db.execute(
        "SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? AND DATE(completion_date) = ?",
        [id, userId, today]
      );

      console.log(`🔹 Existing log for today:`, existingTodayLog.length > 0 ? "Yes" : "No");

      if (completed) {
        // If marking as completed and no log exists for today, insert a new one
        if (existingTodayLog.length === 0) {
          console.log(`🔹 Creating new log entry for today`);
          await db.execute(
            "INSERT INTO habit_logs (habit_id, user_id, completion_date) VALUES (?, ?, ?)",
            [id, userId, today]
          );
        }
        // If already marked complete for today, do nothing to the log
      } else {
        // If unmarking and a log exists for today, delete it
        if (existingTodayLog.length > 0) {
          console.log(`🔹 Removing today's log entry`);
          await db.execute(
            "DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND DATE(completion_date) = ?",
            [id, userId, today]
          );
        }
      }

      // Update the habit's completed status in the habits table
      await db.execute(
        "UPDATE habits SET completed = ? WHERE id = ? AND user_id = ?",
        [completed ? 1 : 0, id, userId]
      );

      // 🏅 Check and award badges after successful completion
      console.log(`🏅 Checking for badges after habit completion for user ${userId}`);
      const newBadge = await checkAndAwardBadges(userId);
      
      // Calculate the updated mood after habit completion
      const moodUtils = require("../utils/moodUtils");
      const updatedMood = await moodUtils.calculateMood(userId);
      console.log(`😊 Updated mood for user ${userId} after habit completion: ${updatedMood}`);
      
      if (newBadge) {
        console.log(`🎉 User ${userId} earned a new badge after completing habit:`, newBadge);
        return res.json({ 
          message: completed ? "Habit marked as completed for today!" : "Habit marked as uncompleted for today!",
          badge: newBadge,
          mood: updatedMood
        });
      } else {
        console.log(`ℹ️ No new badges earned for user ${userId} after completing habit`);
      }

      return res.json({ 
        message: completed ? "Habit marked as completed for today!" : "Habit marked as uncompleted for today!",
        mood: updatedMood
      });
    }

    // For one-time habits or if we didn't return earlier
    let completionDate = completed ? today : null;
    console.log("🔹 Completion Date to be updated:", completionDate);

    // ✅ Update habit_logs
    await db.execute(
      "INSERT INTO habit_logs (habit_id, user_id, completion_date) " +
      "VALUES (?, ?, ?) " +
      "ON DUPLICATE KEY UPDATE completion_date = ?",
      [id, userId, completionDate, completionDate]
    );

    // ✅ Update habits table
    await db.execute(
      "UPDATE habits SET completed = ? WHERE id = ? AND user_id = ?",
      [completed ? 1 : 0, id, userId]
    );
    
    // 🏅 Check and award badges after successful completion
    console.log(`🏅 Checking for badges after habit completion for user ${userId}`);
    const newBadge = await checkAndAwardBadges(userId);
    
    // Calculate the updated mood after habit completion
    const moodUtils = require("../utils/moodUtils");
    const updatedMood = await moodUtils.calculateMood(userId);
    console.log(`😊 Updated mood for user ${userId} after habit completion: ${updatedMood}`);
    
    if (newBadge) {
      console.log(`🎉 User ${userId} earned a new badge after completing habit:`, newBadge);
      return res.json({ 
        message: completed ? "Habit marked as completed!" : "Habit marked as uncompleted!",
        badge: newBadge,
        mood: updatedMood
      });
    }
    
    res.json({ 
      message: completed ? "Habit marked as completed!" : "Habit marked as uncompleted!",
      mood: updatedMood
    });
  } catch (error) {
    console.error("❌ Error updating habit completion:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to calculate user's current streak
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

// Route to get the current streak
const getUserStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Import the streak calculation function
    const { calculateStreak } = require("../utils/moodUtils");
    
    const streak = await calculateStreak(userId);
    console.log(`User ${userId} streak: ${streak}`);
    res.json({ streak });
  } catch (error) {
    console.error("Error retrieving streak:", error);
    res.status(500).json({ message: "Error retrieving streak" });
  }
};

// 🆕 Route to get the user's mood
const getUserMood = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 Getting mood for user ${userId}`);
    
    // Import the mood calculation function
    const moodUtils = require("../utils/moodUtils");
    
    // Calculate the mood
    const mood = await moodUtils.calculateMood(userId);
    console.log(`😊 Calculated mood for user ${userId}: ${mood}`);
    
    // Get the streak for the response
    const streak = await calculateStreak(userId);
    console.log(`🔥 User ${userId} current streak: ${streak}`);
    
    // Get today's completions for debugging
    const completionsToday = await moodUtils.getTodayCompletions(userId);
    console.log(`🔍 User ${userId} has ${completionsToday.length} completions today`);
    
    // Log the response we're sending
    console.log(`🔍 Sending mood response:`, { mood, streak });
    
    res.status(200).json({ mood, streak });
  } catch (error) {
    console.error("❌ Error getting user mood:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Fetch the habit streak
const getHabitStreak = async (req, res) => {
  try {
    const userId = req.user.id;
    const habitId = req.params.habitId;

    console.log("🔹 Fetching streak for habit:", { habitId, userId });

    const query =
      "SELECT hl.completion_date " +
      "FROM habit_logs hl " +
      "JOIN habits h ON hl.habit_id = h.id " +
      "WHERE hl.user_id = ? AND hl.habit_id = ? " +
      "AND h.type = 'daily' " +
      "ORDER BY hl.completion_date DESC";

    const [logs] = await db.execute(query, [userId, habitId]);

    console.log("🔹 Retrieved habit logs:", logs.length, "logs");

    if (logs.length === 0) {
      console.log("🔹 No logs found, streak is 0");
      return res.status(200).json({ streak: 0 });
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
    let mostRecentDate = new Date(logs[0].completion_date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Check if the most recent completion is from today or yesterday
    // If not, the current streak is broken
    if (mostRecentDate.getTime() !== today.getTime() && 
        mostRecentDate.getTime() !== yesterday.getTime()) {
      console.log("🔹 Most recent completion is not from today or yesterday, streak broken");
      return res.status(200).json({ streak: 0 });
    }
    
    // Start checking from the second most recent day
    let expectedDate = new Date(mostRecentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    
    for (let i = 1; i < logs.length; i++) {
      let completedDate = new Date(logs[i].completion_date);
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

    console.log("🔹 Streak calculated:", streak);

    res.status(200).json({ streak });
  } catch (err) {
    console.error("❌ Error fetching streak:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Complete Habit
const completeHabit = async (req, res) => {
  const { habitId } = req.params;
  const userId = req.user ? req.user.id : null;

  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    console.log("🔹 Marking habit as completed:", { habitId, userId, date: today });

    // Check if the habit exists and get its type
    const [habitRows] = await db.execute(
      "SELECT * FROM habits WHERE id = ? AND user_id = ?",
      [habitId, userId]
    );

    if (habitRows.length === 0) {
      return res.status(404).json({ message: "Habit not found!" });
    }

    const habitType = habitRows[0].type;

    // Check if there's already a log for today
    const [existingTodayLog] = await db.execute(
      "SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? AND DATE(completion_date) = ?",
      [habitId, userId, today]
    );

    if (existingTodayLog.length > 0) {
      console.log("🔹 Habit already completed today");
      return res.json({ message: "Habit already marked as completed for today!" });
    }

    // Insert a new log for today
    await db.execute(
      "INSERT INTO habit_logs (habit_id, user_id, completion_date) VALUES (?, ?, ?)",
      [habitId, userId, today]
    );

    // Update the habit's completed status in the habits table
    await db.execute(
      "UPDATE habits SET completed = 1 WHERE id = ? AND user_id = ?",
      [habitId, userId]
    );

    // Check and award badges
    console.log(`🏅 Checking for badges after habit completion for user ${userId}`);
    const newBadge = await checkAndAwardBadges(userId);
    
    // Calculate the updated mood after habit completion
    const moodUtils = require("../utils/moodUtils");
    const updatedMood = await moodUtils.calculateMood(userId);
    console.log(`😊 Updated mood for user ${userId} after habit completion: ${updatedMood}`);
    
    if (newBadge) {
      console.log(`🎉 User ${userId} earned a new badge after completing habit:`, newBadge);
      return res.json({ 
        message: "Habit marked as completed for today!",
        badge: newBadge,
        mood: updatedMood
      });
    }

    res.json({ 
      message: "Habit marked as completed for today!",
      mood: updatedMood
    });
  } catch (error) {
    console.error("❌ Error completing habit:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Now export after defining all functions
module.exports = { markHabitComplete, getHabitStreak, completeHabit, getUserStreak, getUserMood };
