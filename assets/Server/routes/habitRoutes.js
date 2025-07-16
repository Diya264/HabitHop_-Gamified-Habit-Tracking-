const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const { markHabitComplete, completeHabit, getHabitStreak, getUserStreak, getUserMood } = require("../controllers/habitController");
router.get("/mood", authMiddleware, getUserMood);

// Add weekly progress endpoint
router.get("/progress/week", authMiddleware, async (req, res) => {
  console.log("🔥 Weekly progress endpoint hit for user:", req.user.id);
  try {
    const userId = req.user.id;
    
    // Get weekly data
    console.log("🔍 Executing weekly progress query for user:", userId);
    const [weeklyRows] = await db.execute(`
      SELECT DAYNAME(completion_date) as day, COUNT(*) as completed
      FROM habit_logs
      WHERE user_id = ? AND YEARWEEK(completion_date, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY day
    `, [userId]);
    
    console.log("Raw weekly data:", weeklyRows);
    
    // Make sure we have data for all days of the week
    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const result = allWeekDays.map(day => {
      const found = weeklyRows.find(row => row.day === day);
      return {
        day: day.substring(0, 3), // Abbreeviate to 'Sun', 'Mon', etc.
        completed: found ? found.completed : 0
      };
    });
    
    console.log("📈 Processed weekly data:", result);
    res.json(result);
  } catch (err) {
    console.error("❌ Error fetching weekly progress:", err.message);
    res.status(500).json({ error: "Failed to fetch weekly progress" });
  }
});
// router.get("/mood", authMiddleware, habitController.getUserMood);
// Mark a habit as completed
router.post("/habits/:id/complete", authMiddleware, markHabitComplete);

// Add a new habit (with log entry)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { name, goal, type } = req.body;
    const userId = req.user.id;

    console.log("🔥 Received Habit Data:", { name, goal, type }); // Debug log

    if (!name || !goal) {
      return res.status(400).json({ message: "Habit name and goal are required" });
    }

    // Ensure the type is valid
    const validTypes = ["daily", "one-time"];
    const habitType = validTypes.includes(type) ? type : "daily"; // Default to "daily" only if type is invalid

    console.log("Processed Habit Type:", habitType); // Debug log

    // Insert new habit
    const [result] = await db.execute(
      "INSERT INTO habits (user_id, name, goal, type) VALUES (?, ?, ?, ?)",
      [userId, name, goal, habitType]
    );

    const habitId = result.insertId; // Get the newly inserted habit's ID

    // Insert the first entry into habit_logs
    await db.execute(
      "INSERT INTO habit_logs (habit_id, user_id, completion_date) VALUES (?, ?, NULL)",
      [habitId, userId]
    );

    res.status(201).json({ message: "Habit added successfully!", habitId });
  } catch (err) {
    console.error("❌ Error adding habit:", err);
    res.status(500).json({ message: "Error adding habit" });
  }
});

// Get all habits for the logged-in user
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
    
    // Get all habits for the user
    const [habits] = await db.execute("SELECT * FROM habits WHERE user_id = ?", [userId]);
    
    // Get all habit logs for today
    const [todayLogs] = await db.execute(
      "SELECT habit_id FROM habit_logs WHERE user_id = ? AND DATE(completion_date) = ?",
      [userId, today]
    );
    
    console.log(`🔍 Found ${habits.length} habits and ${todayLogs.length} completions for today`);
    
    // Create a Set of habit IDs that have been completed today for faster lookup
    const completedHabitIds = new Set(todayLogs.map(log => log.habit_id));
    
    // Add completed_today property to each habit
    const habitsWithCompletionStatus = habits.map(habit => ({
      ...habit,
      completed_today: completedHabitIds.has(habit.id)
    }));
    
    console.log(`🔍 Returning ${habitsWithCompletionStatus.length} habits with completion status`);
    res.json(habitsWithCompletionStatus);
  } catch (err) {
    console.error("❌ Error retrieving habits:", err);
    res.status(500).json({ message: "Error retrieving habits" });
  }
});

// Update a habit
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const habitId = req.params.id;
    const { completed, type } = req.body;
    const userId = req.user.id;

    if (!habitId || !userId) {
      console.error("❌ Missing habitId or userId!", { habitId, userId });
      return res.status(400).json({ message: "Missing habit ID or user ID" });
    }

    console.log("🔹 Received Habit Update Request:", { habitId, completed, type });

    // Ensure type remains unchanged if not provided
    const [existingHabit] = await db.execute("SELECT type FROM habits WHERE id = ?", [habitId]);
    const updatedType = type || existingHabit[0].type;

    // Update `completed` status and `type` in `habits` table
    await db.execute(
      "UPDATE habits SET completed = ?, type = ? WHERE id = ? AND user_id = ?",
      [completed ?? 0, updatedType, habitId, userId]
    );




    

 // Update the habit_logs table
 if (completed) {
  const completionDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  console.log("🔹 Marking habit as complete. Updating habit_logs with:", completionDate);

  await db.execute(
    `INSERT INTO habit_logs (habit_id, user_id, completion_date)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE completion_date = VALUES(completion_date)`,
    [habitId, userId, completionDate]
  );
} else {
  console.log("🔹 Marking habit as uncompleted. Resetting completion_date.");
  await db.execute(
    "UPDATE habit_logs SET completion_date = NULL WHERE habit_id = ? AND user_id = ?",
    [habitId, userId]
  );
}

    res.json({ message: "Habit updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating habit:", err);
    res.status(500).json({ message: "Error updating habit" });
  }
});

// Delete a habit
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const habitId = req.params.id;
    await db.execute("DELETE FROM habits WHERE id = ?", [habitId]);

    res.json({ message: "Habit deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting habit:", err);
    res.status(500).json({ message: "Error deleting habit" });
  }
});

router.post("/:habitId/complete", authMiddleware, completeHabit);
router.get("/:habitId/streak", authMiddleware, getHabitStreak);
router.get("/streak", authMiddleware, getUserStreak);

module.exports = router;
