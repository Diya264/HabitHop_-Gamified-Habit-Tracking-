import { useEffect, useState } from "react";
import axios from "axios";
import { getHabits, addHabit, updateHabit, deleteHabit } from "../api/habitService";
import { checkForEarnedBadges, checkForRandomBadge } from "../services/badgeService";
import BadgeNotification from "../components/BadgeNotification";
import "./Habits.css";

function Habits() {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [habitType, setHabitType] = useState("daily"); // Default to daily habit
  const [newBadge, setNewBadge] = useState(null); // State to track newly earned badges
  const token = localStorage.getItem("token"); // Get token for authentication
  
  // Debug log when component mounts
  useEffect(() => {
    console.log('🔍 Habits component mounted');
  }, []);

  // Fetch habits when the page loads
  useEffect(() => {
    async function fetchHabits() {
      try {
        const data = await getHabits(token);
        setHabits(data);
      } catch (err) {
        console.error("Error fetching habits:", err);
      }
    }
    fetchHabits();
  }, []);

  // Add a habit
  const handleAddHabit = async () => {
    if (!newHabit.trim()) return;
    try {
      console.log(`🆕 Adding new habit: "${newHabit}" with type: "${habitType}"`);
      await addHabit({ 
        name: newHabit, 
        goal: "Daily", 
        type: habitType // Pass the selected habit type
      }, token);
      setNewHabit("");
      // Don't reset habit type to keep the user's preference
      const updatedHabits = await getHabits(token);
      setHabits(updatedHabits);
    } catch (err) {
      console.error("Error adding habit:", err);
    }
  };

  // toggle habit completion
  const handleToggleHabit = async (habitId, completed) => {
    try {
      // Find the habit to get its type
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        console.error(`❌ Habit with ID ${habitId} not found`);
        return;
      }
      
      console.log(`🔄 Toggling habit ${habitId} (${habit.name}) from ${completed} to ${!completed}, type: ${habit.type}`);
      
      // For one-time habits, prevent uncompleting if already completed
      if (habit.type === 'one-time' && completed) {
        console.log(`⚠️ Cannot unmark a completed one-time habit`);
        alert("One-time habits cannot be unmarked once completed");
        return;
      }
      
      // Only check for badges if we're completing a habit (not uncompleting)
      if (!completed) {
        console.log(`✅ Habit ${habitId} is being completed, will check for badges`);
        
        try {
          // Get the user ID from the token
          const userInfo = JSON.parse(atob(token.split('.')[1]));
          const userId = userInfo.id;
          
          if (userId) {
            // Get the current badges BEFORE updating the habit
            console.log(`👤 Getting current badges for user ${userId} before habit completion`);
            const beforeBadgesResponse = await axios.get(`http://localhost:5000/api/badges/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Store the IDs of currently unlocked badges
            const unlockedBadgesBefore = beforeBadgesResponse.data.filter(badge => badge.unlocked);
            const unlockedBadgeIdsBefore = new Set(unlockedBadgesBefore.map(badge => badge.id));
            console.log(`📊 User has ${unlockedBadgesBefore.length} unlocked badges before habit completion`);
            
            // Now update the habit
            console.log(`🔄 Updating habit ${habitId} to completed=true`);
            await updateHabit(habitId, true, token);
            
            // Refresh the habits list
            const updatedHabits = await getHabits(token);
            setHabits(updatedHabits);
            
            // Dispatch event to notify Dashboard of habit update
            const habitUpdateEvent = new CustomEvent('habit-updated');
            window.dispatchEvent(habitUpdateEvent);
            
            // Trigger pet mood refresh
            setTimeout(() => {
              console.log(`🐱 Triggering pet mood refresh after habit completion`);
              const event = new CustomEvent('refresh-pet-mood');
              window.dispatchEvent(event);
            }, 1000);
            
            // Call the backend to check and award badges
            console.log(`🏆 Checking for new badges after habit completion`);
            const badgeCheckResponse = await axios.get(`http://localhost:5000/api/badges/check/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Get the badges AFTER the check to see if any new ones were unlocked
            console.log(`🔍 Getting updated badges after check`);
            const afterBadgesResponse = await axios.get(`http://localhost:5000/api/badges/user/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            // Find all unlocked badges after the check
            const unlockedBadgesAfter = afterBadgesResponse.data.filter(badge => badge.unlocked);
            console.log(`📊 User has ${unlockedBadgesAfter.length} unlocked badges after check`);
            
            // Find newly unlocked badges by comparing before and after
            const newlyUnlockedBadges = unlockedBadgesAfter.filter(badge => 
              !unlockedBadgeIdsBefore.has(badge.id)
            );
            
            // If we have newly unlocked badges, show a notification
            if (newlyUnlockedBadges.length > 0) {
              console.log(`🎉 User earned ${newlyUnlockedBadges.length} new badge(s):`);
              newlyUnlockedBadges.forEach(badge => console.log(`- ${badge.badge_name || badge.name}`));
              
              // Show notification for the first newly unlocked badge
              const badgeToShow = newlyUnlockedBadges[0];
              console.log(`🎯 Setting badge notification for: ${badgeToShow.badge_name || badgeToShow.name}`);
              
              // Force React to recognize this as a new object to trigger re-render
              const badgeWithTimestamp = {
                ...badgeToShow,
                _timestamp: Date.now() // Add a timestamp to ensure React sees this as a new object
              };
              
              console.log(`🎯 Setting newBadge state with timestamped badge:`, badgeWithTimestamp);
              setNewBadge(badgeWithTimestamp);
              
              // Force a refresh of the badges in the Rewards tab
              localStorage.setItem("badgesUpdated", Date.now().toString());
            } 
            // If no new badges were unlocked but the backend reported a badge, check if it's valid
            else if (badgeCheckResponse.data && badgeCheckResponse.data.earned) {
              const reportedBadge = badgeCheckResponse.data.badge;
              console.log(`🔍 Backend reported a badge, checking if it's valid:`, reportedBadge);
              
              // Verify the badge exists and is unlocked in the database
              const isBadgeUnlocked = unlockedBadgesAfter.some(badge => 
                badge.id === reportedBadge.id && !unlockedBadgeIdsBefore.has(reportedBadge.id)
              );
              if (isBadgeUnlocked) {
                console.log(`✅ Badge ${reportedBadge.id} is confirmed newly unlocked in the database`);
                console.log(`🎯 Setting badge notification for reported badge: ${reportedBadge.badge_name || reportedBadge.name}`);
              
                
                // Force React to recognize this as a new object to trigger re-render
                const badgeWithTimestamp = {
                  ...reportedBadge,
                  _timestamp: Date.now() // Add a timestamp to ensure React sees this as a new object
                };
                
                console.log(`🎯 Setting newBadge state with timestamped badge:`, badgeWithTimestamp);
                setNewBadge(badgeWithTimestamp);
                localStorage.setItem("badgesUpdated", Date.now().toString());
              } else {
                console.log(`❌ Badge ${reportedBadge.id} is either not unlocked or was already earned before, not showing notification`);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Error during badge check process:`, error);
        }
      } else {
        // Just update the habit without checking for badges (when uncompleting)
        console.log(`🔄 Uncompleting habit ${habitId}, no badge check needed`);
        await updateHabit(habitId, false, token);
        
        // Refresh the habits list
        const updatedHabits = await getHabits(token);
        setHabits(updatedHabits);
        
        // Dispatch event to notify Dashboard of habit update
        const habitUpdateEvent = new CustomEvent('habit-updated');
        window.dispatchEvent(habitUpdateEvent);
        
        // Trigger pet mood refresh
        setTimeout(() => {
          console.log(`🐱 Triggering pet mood refresh after habit update`);
          const event = new CustomEvent('refresh-pet-mood');
          window.dispatchEvent(event);
        }, 1000);
      }
    } catch (err) {
      console.error("Error updating habit:", err);
    }
  };

  // Delete a habit
  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId, token);
      setHabits(habits.filter((habit) => habit.id !== habitId));
    } catch (err) {
      console.error("Error deleting habit:", err);
    }
  };

  // Log when newBadge changes
  useEffect(() => {
    if (newBadge) {
      console.log('🎯 Habits component newBadge state updated:', newBadge);
    }
  }, [newBadge]);

  return (
    <div className="habit-dashboard">
      {/* Badge notification popup */}
      {newBadge ? (
        <>
          {console.log('🎯 Rendering BadgeNotification with badge:', newBadge)}
          <BadgeNotification 
            badge={newBadge} 
            onClose={() => {
              console.log('🎯 BadgeNotification onClose called, setting newBadge to null');
              setNewBadge(null);
            }} 
          />
        </>
      ) : console.log('🎯 No badge to show in notification')}
      
      <div className="dashboard-header">
        <div className="header-left">
          <div className="app-icon">
            {/* You'll need to add icons or use emoji here */}
            🐰
          </div>
          <div className="app-title">
            <h2>Habit Tracker</h2>
            <p className="app-subtitle">Build better habits daily</p>
          </div>
        </div>
        <div className="streak-badge">
          {/* Award icon or emoji */}
          🏆
        </div>
      </div>
      
      {/* Add Habit Form */}
      <div className="habit-form-container">
        <div className="habit-form">
          <input 
            className="habit-input"
            type="text" 
            value={newHabit} 
            onChange={(e) => setNewHabit(e.target.value)} 
            placeholder="Add a new habit..." 
            onKeyPress={(e) => e.key === 'Enter' && handleAddHabit()}
          />
          <select 
            value={habitType}
            onChange={(e) => setHabitType(e.target.value)}
            className="habit-type-select">
            <option value="daily">Daily Habit</option>
            <option value="one-time">One-time Task</option>
          </select>
          <button className="add-button" onClick={handleAddHabit}>Add</button>
        </div>
      </div>
  
      {/* Display Habits */}
      <ul className="habits-list">
        {habits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-emoji">🚀</div>
            <p className="empty-message">Your habits will appear here</p>
            <p className="empty-hint">Add one to get started!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <li key={habit.id} className={`habit-item ${habit.completed ? 'completed' : ''}`}>
              <div className="habit-left">
                <button 
                  className={`toggle-button ${habit.completed ? 'completed' : ''}`}
                  onClick={() => handleToggleHabit(habit.id, habit.completed)}
                >
                  <span className={`check-icon ${habit.completed ? 'visible' : ''}`}>✓</span>
                </button>
                <div className="habit-info">
                  <p className={`habit-name ${habit.completed ? 'completed' : ''}`}>
                    {habit.name}
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        marginLeft: '8px', 
                        padding: '2px 6px', 
                        borderRadius: '10px', 
                        background: habit.type === 'daily' ? '#4caf50' : '#ff9800',
                        color: 'white'
                      }}
                    >
                      {habit.type === 'daily' ? 'Daily' : 'One-time'}
                    </span>
                  </p>
                  {habit.type === 'daily' && habit.streak > 0 && (
                    <div className="streak-indicator">
                      <span className="streak-icon">⚡</span>
                      <span>{habit.streak} day{habit.streak !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
              <button className="delete-button" onClick={() => handleDeleteHabit(habit.id)}>❌</button>
            </li>
          ))
        )}
      </ul>
      
      {/* Motivational Section */}
      <div className="motivation-section">
        <div className="motivation-icon">⚡</div>
        <p className="motivation-text">Build momentum daily</p>
        <p className="motivation-subtext">Small actions. Big results.</p>
      </div>
    </div>
  );
}

export default Habits;
