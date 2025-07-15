import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "chart.js/auto";
import "./Dashboard.css";
import Rewards from "./Rewards";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ProgressTab from "./ProgressTab";
import Habits from "./Habits";
import VirtualPet from '../components/Pet';
import BadgeNotification from '../components/BadgeNotification';
import { checkForEarnedBadges, checkForRandomBadge } from '../services/badgeService';
import StreakDisplay from '../components/StreakDisplay';
import { FaPlus, FaChartBar, FaPaw, FaBell, FaCalendar } from "react-icons/fa";
import FortuneCookie from "./FortuneCookie";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // 🆕 Track current tab
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [habits, setHabits] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null); // State to track newly earned badges
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger state
  // const [petMood, setPetMood] = useState('happy');

  useEffect(() => {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("User data received:", response.data);
        // Check if name exists in the response
        if (!response.data.name) {
          console.warn("Name field is missing in user data!");
        }
        setUser(response.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        navigate("/login");
      });
  }, [navigate]);
   
  // This useEffect is just for loading badges for display in the Rewards tab
  useEffect(() => {
    const fetchEarnedBadges = async () => {
      if (user) {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const res = await axios.get(`http://localhost:5000/api/badges/user/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          // Filter to only include unlocked badges
          const earned = Array.isArray(res.data) ? res.data.filter(badge => badge.unlocked) : [];
          setEarnedBadges(earned);
        } catch (error) {
          console.error("Error fetching earned badges:", error);
          setEarnedBadges([]);
        }
      }
    };
    
    if (user) {
      fetchEarnedBadges();
    }
  }, [user, refreshTrigger]);

// ✅ Load today's habits from backend
const loadHabits = () => {
  if (user) {
    const token = localStorage.getItem("token");
    console.log("Loading habits for dashboard...");

    axios
      .get("http://localhost:5000/api/habits/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Habits loaded:", res.data);
        setHabits(res.data); // ✅ store real habits
      })
      .catch((err) => {
        console.error("Failed to load habits", err);
      });
  }
};

// Load habits when user data is available
useEffect(() => {
  if (user) {
    loadHabits();
  }
}, [user]);

// Refresh habits when dashboard tab is active
useEffect(() => {
  if (activeTab === "dashboard" && user) {
    loadHabits();
  }
}, [activeTab, user]);

// Listen for habit updates from other components
useEffect(() => {
  const handleHabitUpdate = () => {
    console.log("Habit update detected, refreshing dashboard habits...");
    loadHabits();
  };
  
  // Create a custom event listener for habit updates
  window.addEventListener('habit-updated', handleHabitUpdate);
  
  return () => {
    window.removeEventListener('habit-updated', handleHabitUpdate);
  };
}, []);


  // Function to initialize and update the progress chart
  const initializeProgressChart = () => {
    if (!user) return;
    
    const progressChart = document.getElementById('progressChart');
    if (!progressChart) return;
    
    const ctx = progressChart.getContext('2d');
    
    // Destroy existing chart if it exists
    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx).destroy();
    }

    // ✅ Fetch weekly progress data from backend
    console.log("Fetching weekly progress data...");
    
    // Function to create the chart with the provided data
    const createChart = (chartData) => {
      console.log("Creating chart with data:", chartData);
      
      // Convert data format if needed
      let formattedData;
      
      // Check if data is in object format (like in ProgressTab) or array format
      if (!Array.isArray(chartData) && typeof chartData === 'object') {
        // Convert from object format {Mon: 3, Tue: 2} to array format
        formattedData = Object.entries(chartData).map(([day, count]) => ({
          day,
          completed: count
        }));
      } else {
        // Already in array format
        formattedData = chartData;
      }
      
      const labels = formattedData.map((d) => d.day);
      const data = formattedData.map((d) => d.completed || d.count || 0); // Handle both property names
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Tasks Completed',
            data,
            backgroundColor: '#a2bedf',
            borderColor: '#7e99b9',
            borderWidth: 1,
            borderRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 10,
              ticks: {
                stepSize: 2
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    };
    
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Try the main progress endpoint first (same as ProgressTab)
    axios
      .get("http://localhost:5000/api/habits/progress", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Progress data received:", response.data);
        
        // Check if we have weekly data in the expected format
        if (response.data && response.data.week) {
          console.log("Weekly data found in progress response:", response.data.week);
          createChart(response.data.week);
        } else {
          throw new Error("Weekly data not found in progress response");
        }
      })
      .catch((err) => {
        console.error("Failed to load from main progress endpoint", err);
        
        // Try the direct weekly endpoint
        console.log("Trying direct weekly endpoint...");
        axios
          .get("http://localhost:5000/api/progress/weekly", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("Direct weekly data received:", response.data);
            createChart(response.data);
          })
          .catch((weeklyErr) => {
            console.error("Direct weekly endpoint failed", weeklyErr);
            
            // Try the original endpoint from Dashboard
            console.log("Trying original Dashboard endpoint...");
            axios
              .get("http://localhost:5000/habits/progress/week", {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((response) => {
                console.log("Original endpoint data received:", response.data);
                createChart(response.data);
              })
              .catch((originalErr) => {
                console.error("All endpoints failed", originalErr);
                
                // Create a fallback chart with sample data
                console.log("Using fallback data");
                createChart({
                  'Sun': 1,
                  'Mon': 2,
                  'Tue': 3,
                  'Wed': 4,
                  'Thu': 3,
                  'Fri': 2,
                  'Sat': 1
                });
              });
          });
      });
  };

  // Initialize chart when user data is loaded
  useEffect(() => {
    if (user && activeTab === "dashboard") {
      // Small timeout to ensure the DOM is ready
      setTimeout(initializeProgressChart, 100);
      
      // We'll remove the automatic badge check on load since it's causing false notifications
    }
  }, [user]);
  
  // Reinitialize chart when switching back to dashboard tab
  useEffect(() => {
    if (activeTab === "dashboard" && user) {
      // Small timeout to ensure the DOM is ready
      setTimeout(initializeProgressChart, 100);
    }
  }, [activeTab]);



  useEffect(() => {
    const fetchEarnedBadges = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user) return;
        
        // Use the user/:userId route instead
        const res = await axios.get(`http://localhost:5000/api/badges/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter to only include unlocked badges
        const earned = Array.isArray(res.data) ? res.data.filter(badge => badge.unlocked) : [];
        setEarnedBadges(earned);
      } catch (error) {
        console.error("Error fetching earned badges:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        }
        setEarnedBadges([]);
      }
    };
  
    if (user) {
      fetchEarnedBadges();
    }
  }, [user]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <div className="sidebar">
        <div className="logo">
          <span className="logo-icon">🐾</span>
          <span>HabitHop</span>
        </div>
        <div className="nav-items">
          <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === "habits" ? "active" : ""}`} onClick={() => setActiveTab("habits")}>
            <span className="nav-icon">✅</span>
            <span>Habits</span>
          </div>
          <div className={`nav-item ${activeTab === "progress" ? "active" : ""}`} onClick={() => setActiveTab("progress")}>
            <span className="nav-icon">📈</span>
            <span>Progress</span>
          </div>
          <div className={`nav-item ${activeTab === "pet" ? "active" : ""}`} onClick={() => setActiveTab("pet")}>
            <span className="nav-icon">🐶</span>
            <span>Pet</span>
          </div>
          <div className={`nav-item ${activeTab === "rewards" ? "active" : ""}`} onClick={() => setActiveTab("rewards")}>
            <span className="nav-icon">🏆</span>
            <span>Rewards</span>
          </div>
          <div className={`nav-item ${activeTab === "fortune" ? "active" : ""}`} onClick={() => setActiveTab("fortune")}>
            <span className="nav-icon">🥠</span>
              <span>Fortune</span>
          </div>
          {/* <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </div> */}
          <div className="nav-item logout-button" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SECTION BASED ON TABS */}
      {activeTab === "dashboard" && (
        <>
          <div className="main-content">
            <div className="header">
              <div>
                <h1 className="welcome">Welcome, {user.name || user.email}</h1>
                <p className="date">{currentDate}</p>
                
                {/* Debug buttons removed */}
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Left Column */}
              <div>
                {/* Daily Tasks */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Daily Tasks</h2>
                    <div className="card-actions">
                      <button className="card-action">Today</button>
                    </div>
                  </div>

                  <div className="progress-circle-container">
                    {/* Calculate completion percentage */}
                    {(() => {
                      // Use completed_today if available, otherwise fall back to completed
                      const completedCount = habits.filter(h => {
                        return h.completed_today === true || (h.completed_today === undefined && h.completed === 1);
                      }).length;
                      
                      const totalCount = habits.length;
                      const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                      
                      return (
                        <div 
                          className="progress-circle" 
                          style={{
                            background: `conic-gradient(var(--success) 0% ${percentage}%, #e9ecef ${percentage}% 100%)`
                          }}
                        ></div>
                      );
                    })()}
                    <div className="progress-content">                  
                      <div className="progress-number">
                        {habits.filter(h => {
                          return h.completed_today === true || (h.completed_today === undefined && h.completed === 1);
                        }).length}
                      </div>
                      <div className="progress-label">Daily Tasks</div>
                    </div>
                  </div>
                  
                  {/* Streak Display */}
                  <StreakDisplay />


{/* ✅ Render real habits */}
<div className="habit-list">
  {habits.slice().reverse().slice(0, 4).map((habit) => (
    <div key={habit.id} className="habit-item">
      <div className="habit-info">
        <div className="habit-icon">{habit.icon || "✅"}</div>
        <div>
          <div className="habit-name">{habit.name}</div>          
        </div>
      </div>
      <div className="habit-status">
        {(habit.completed_today === true || (habit.completed_today === undefined && habit.completed === 1)) ? "✅" : "❌"}
      </div>
    </div>
  ))}
</div>
                
                </div>

                {/* Progress */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Progress Tracking</h2>
                    <div className="card-actions">
                      <button className="card-action">Week</button>
                    </div>
                  </div>

                  <div className="chart-container" style={{ height: "300px" }}>
                    <canvas id="progressChart"></canvas>
                  </div>
                </div>

                <div className="motivational-quote">
                  "Small daily improvements are the key to staggering long-term results."
                </div>
              </div>

              {/* Right Column */}
              <div>                
                {/* Achievements */}
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Achievements</h2>
                  </div>
                  <div className="achievements">
                  {earnedBadges.length > 0 ? (
    // Limit to displaying only the first 15 badges
    earnedBadges.slice(0, 15).map((badge) => (
      <div key={badge.id} className="badge-item">
        <img src={`/assets/badges/${badge.icon}`} alt={badge.badgeName} />
        <span>{badge.badgeName}</span>
      </div>
    ))
  ) : (
    <p>No achievements earned yet</p>
  )}
                  </div>
                  {/* Show a message if there are more badges than displayed */}
                  {earnedBadges.length > 15 && (
                    <div className="more-badges-message">
                      <p>+ {earnedBadges.length - 15} more badges. View all in Rewards tab.</p>
                    </div>
                  )}
                </div>

                {/* Calendar */}                
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">Calendar</h2>
                  </div>

                  <div className="calendar-wrapper">
                    <Calendar />
                  </div>
                </div>
              </div>
            </div>
          </div>
         </>
      )}

{activeTab === "habits" && (
  <div className="main-content">
    <Habits user={user} />
  </div>
)}

{activeTab === "progress" && (
  <div className="main-content">
    <ProgressTab />
  </div>
)}

{activeTab === "rewards" && <Rewards user={user} />}

{activeTab === "fortune" && (
  <div className="main-content fortune-tab" style={{ 
    padding: 0, 
    overflow: 'hidden',
    maxWidth: '100%',
    width: '100%',
    height: '100vh',
    margin: 0
  }}>
    <FortuneCookie />
  </div>
)}


{activeTab === "pet" && (
  <div className="main-content">
    <VirtualPet user={user} />
  </div>
)}

      {/* Badge notification popup */}
      {newBadge && (
        <BadgeNotification 
          badge={newBadge} 
          onClose={() => setNewBadge(null)} 
        />
      )}
    </div>
  );
}

export default Dashboard;

