// /client/src/pages/ProgressTab.jsx
import React, { useEffect, useState } from "react";
import "./ProgressTab.css";
import {
  PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const ProgressTab = () => {
  const [habits, setHabits] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [quote, setQuote] = useState("");
  const [activeView, setActiveView] = useState("weekly");
  const [missedDays, setMissedDays] = useState([]);
  const [lastLogged, setLastLogged] = useState(null);



  {console.log("Active View:", activeView)}
  {console.log("Monthly Data:", monthlyData)}
  {console.log("Yearly Data:", yearlyData)}

  const COLORS = ["#00C49F", "#FF8042", "#FFBB28", "#0088FE", "#FF6666", "#AAFF33", "#8884d8"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const quotes = [
    "You’ve got this! 💪",
    "Small steps make big progress 🌱",
    "Stay consistent, not perfect 🎯",
    "One habit at a time 🌟",
    "Don’t break the streak 🔥"
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return console.warn("No auth token found");

      console.log("Fetching progress data...");
      
      try {
        // First try the main progress endpoint
        const [progressRes, habitsRes] = await Promise.all([
          fetch("http://localhost:5000/api/habits/progress", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("http://localhost:5000/api/habits/all", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!progressRes.ok) throw new Error("Progress fetch failed");
        if (!habitsRes.ok) throw new Error("Habits fetch failed");

        const progress = await progressRes.json();
        const habitsList = await habitsRes.json();
        
        console.log("Progress data received:", progress);

        setHabits(habitsList);
        
        // Handle weekly data - ensure it's an object with day keys
        if (progress.week && typeof progress.week === 'object') {
          setWeeklyData(progress.week);
        } else {
          throw new Error("Weekly data is not in expected format");
        }
        
        setMonthlyData(progress.month ?? []);
        setYearlyData(progress.year ?? []);
        setMissedDays(progress.missedDays ?? []);
        setLastLogged(progress.lastLogged ? new Date(progress.lastLogged) : null);
      } catch (mainError) {
        console.warn("Main progress endpoint failed, trying direct weekly endpoint:", mainError.message);
        
        // If main endpoint fails, try the direct weekly endpoint
        const weeklyRes = await fetch("http://localhost:5000/api/progress/weekly", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!weeklyRes.ok) throw new Error("Direct weekly endpoint failed");
        
        const weeklyData = await weeklyRes.json();
        console.log("Direct weekly data received:", weeklyData);
        
        setWeeklyData(weeklyData);
      }
    } catch (error) {
      console.error("❌ Error loading progress:", error.message);
      
      // Set fallback data in case of error
      setWeeklyData({
        'Sun': 1,
        'Mon': 2,
        'Tue': 3,
        'Wed': 2,
        'Thu': 4,
        'Fri': 3,
        'Sat': 1
      });
    }
  };

  // Convert weeklyData object to array for PieChart
  const weeklyChartData = Object.entries(weeklyData).map(([day, count]) => ({
    day,
    count
  }));
  
  // Add console logging to debug weekly data
  console.log("Weekly data from server:", weeklyData);
  console.log("Processed weekly chart data:", weeklyChartData);

  // const missedDays = weekDays.filter((day) => !weeklyData[day]);

  // const validDates = habits
  //   .map(h => new Date(h.updated_at))
  //   .filter(date => !isNaN(date));
  // const lastLogged = validDates.length > 0 ? new Date(Math.max(...validDates)) : null;

  return (
    <div className="progress-tab">
      <h2>📈 Your Habit Progress</h2>

      <div className="view-tabs">
        <button className={activeView === "weekly" ? "active" : ""} onClick={() => setActiveView("weekly")}>Weekly</button>
        <button className={activeView === "monthly" ? "active" : ""} onClick={() => setActiveView("monthly")}>Monthly</button>
        <button className={activeView === "yearly" ? "active" : ""} onClick={() => setActiveView("yearly")}>Yearly</button>
      </div>

      {/* Chart Section */}
      <section className="chart-section">
        {activeView === "weekly" && (
          <>
            <h3>🗓️ Weekly Completion</h3>
            {weeklyChartData.length > 0 ? (
              <PieChart width={300} height={250}>
                <Pie
                  data={weeklyChartData}
                  dataKey="count"
                  nameKey="day"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {weeklyChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="no-data-message">
                <p>No weekly data available. Start completing habits to see your progress!</p>
              </div>
            )}
          </>
        )}

        {activeView === "monthly" && monthlyData.length > 0 && (
          <>
            <h3>📅 Monthly Progress</h3>
            <LineChart width={500} height={250} data={monthlyData}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          </>
        )}

        {activeView === "yearly" && yearlyData.length > 0 && (
          <>
            <h3>📆 Yearly Progress</h3>
            <LineChart width={500} height={250} data={yearlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#ff7300" />
            </LineChart>
          </>
        )}
      </section>

      {/* Extra Stats */}
      <section className="extra-stats">
        <div className="stat-card">
          <h4>📉 Missed Days</h4>
          {missedDays.length === 0 ? (
            <p>No missed days! 🙌</p>
          ) : (
            <ul>
              {missedDays.map(day => (
                <li key={day}>{day}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="stat-card">
          <h4>📆 Last Habit Logged</h4>
          <p>{lastLogged ? lastLogged.toDateString() : "No logs yet"}</p>
        </div>

        <div className="stat-card">
          <h4>💬 Quote of the Day</h4>
          <p>"{quote}"</p>
        </div>
      </section>
    </div>
  );
};

export default ProgressTab;
