const db = require('../config/db');

exports.getUserProgress = async (req, res) => {
  const userId = req.user.id;

  try {
    // Weekly
    const [weeklyRows] = await db.execute(`
      SELECT DAYNAME(completion_date) as day, COUNT(*) as count
      FROM habit_logs
      WHERE user_id = ? AND YEARWEEK(completion_date, 1) = YEARWEEK(CURDATE(), 1)
      GROUP BY day
    `, [userId]);
    
    // Format weekly data to include all days of the week with abbreviated names
    const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const formattedWeeklyData = {};
    
    // Initialize with zeros for all days
    allWeekDays.forEach(day => {
      formattedWeeklyData[day.substring(0, 3)] = 0;
    });
    
    // Fill in actual data
    weeklyRows.forEach(row => {
      const shortDay = row.day.substring(0, 3);
      formattedWeeklyData[shortDay] = row.count;
    });

    // Monthly
    const [monthlyRows] = await db.execute(`
      SELECT DAY(completion_date) as day, COUNT(*) as count
      FROM habit_logs
      WHERE user_id = ? AND MONTH(completion_date) = MONTH(CURDATE())
      GROUP BY day
    `, [userId]);

    // Yearly
    const [yearlyRows] = await db.execute(`
      SELECT MONTHNAME(completion_date) as month, COUNT(*) as count
      FROM habit_logs
      WHERE user_id = ? AND YEAR(completion_date) = YEAR(CURDATE())
      GROUP BY month
    `, [userId]);

    // Last Habit Logged
    const [lastLogRow] = await db.execute(`
      SELECT completion_date 
      FROM habit_logs 
      WHERE user_id = ? 
      ORDER BY completion_date DESC 
      LIMIT 1
    `, [userId]);

    // Missed Days in current week (compare against full week)
    const completedDays = weeklyRows.map(row => row.day);
    // const allWeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const missedDays = allWeekDays.filter(day => !completedDays.includes(day));

    res.json({
      week: formattedWeeklyData,
      month: monthlyRows,
      year: yearlyRows,
      lastLogged: lastLogRow.length > 0 ? lastLogRow[0].completion_date : null,
      missedDays});

  } catch (err) {
    console.error("Error fetching progress:", err.message);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};
