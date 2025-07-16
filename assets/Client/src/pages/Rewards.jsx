import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./rewards.css";

function Rewards({ user }) {
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add a refresh trigger state

  const getIconPath = (filename) => `/assets/badges/${filename}`; 

  // Create a fetchBadges function that can be called to refresh the badges
  const fetchBadges = useCallback(() => {
    console.log("🔄 Fetching badges for user:", user?.id);
    const token = localStorage.getItem("token");
    if (!token || !user) return;

    // Clear any existing badge update flag
    localStorage.removeItem("badgesUpdated");

    // Force a direct check for badges first
    axios
      .get(`http://localhost:5000/api/badges/check/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((checkResponse) => {
        console.log("Badge check response:", checkResponse.data);
        
        // nnow get all badges with their unlocked status
        return axios.get(`http://localhost:5000/api/badges/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((response) => {
        const all = response.data;
        
        // Log the full structure of the first badge to debug
        if (all.length > 0) {
          console.log("First badge full structure:", all[0]);
          console.log("Badge properties:");
          console.log("- badge_name:", all[0].badge_name);
          console.log("- badge_description:", all[0].badge_description);
          console.log("- badge_criteria:", all[0].badge_criteria);
          console.log("- icon:", all[0].icon);
          console.log("- unlocked:", all[0].unlocked);
        }
        
        const earned = all.filter((b) => b.unlocked);
        console.log(`📊 Found ${earned.length} earned badges out of ${all.length} total badges`);
        setAllBadges(all);
        setEarnedBadges(earned);

        all.forEach((badge, i) => {
          console.log(`Badge ${i + 1}: ${badge.badge_name} → ${getIconPath(badge.icon)}`);
        });
      })
      .catch((error) => {
        console.error("Error fetching user badges:", error);
      });
  }, [user]);

  // Call fetchBadges when the component mounts or when refreshTrigger changes
  useEffect(() => {
    fetchBadges();
  }, [fetchBadges, refreshTrigger]);
  
  // Check for badge updates from other components
  useEffect(() => {
    const checkForBadgeUpdates = () => {
      const badgesUpdated = localStorage.getItem("badgesUpdated");
      if (badgesUpdated) {
        console.log("🔄 Badge updates detected, refreshing badges...");
        // Get the timestamp when the update was triggered
        const updateTime = parseInt(badgesUpdated);
        const currentTime = Date.now();
        
        // Only refresh if the update is recent (within the last 10 seconds), preventing old updates from triggering refreshes
        if (!isNaN(updateTime) && (currentTime - updateTime) < 10000) {
          console.log(`🔄 Recent badge update detected (${Math.round((currentTime - updateTime)/1000)}s ago), refreshing badges...`);
          fetchBadges();
        }
        
        // Clear the flag regardless of whether we refreshed
        localStorage.removeItem("badgesUpdated");
      }
    };
    
    // Check immediately
    checkForBadgeUpdates();
    
    // Set up an interval to check for badge updates
    const intervalId = setInterval(checkForBadgeUpdates, 1000); // Check more frequently (every second)
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [fetchBadges]);

  // Add a manual refresh button function
  const handleRefresh = async () => {
    console.log("🔄 Manually refreshing badges...");
    
    if (user) {
      try {
        // First, directly call the backend to check and award badges
        const token = localStorage.getItem("token");
        console.log(`🔍 Manually checking for badges for user ${user.id}`);
        
        // Force a badge check on the server
        await axios.get(`http://localhost:5000/api/badges/check/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log(`✅ Badge check completed, refreshing badge list`);
        
        // Then refresh the badges list
        setRefreshTrigger(prev => prev + 1);
      } catch (error) {
        console.error(`❌ Error during manual badge refresh:`, error);
        // Still refresh even if there was an error
        setRefreshTrigger(prev => prev + 1);
      }
    } else {
      // If no user, just refresh
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleBadgeClick = (badge) => {
    console.log("Badge clicked:", badge);
    
    // Log all properties of the badge
    console.log("Badge properties when clicked:");
    for (const key in badge) {
      console.log(`- ${key}: ${badge[key]}`);
    }
    
    // Add a description property if it doesn't exist
    const enhancedBadge = {
      ...badge,
      // Make sure we have a description property
      description: badge.description || badge.badge_description || "This badge is awarded for completing a special achievement."
    };
    
    console.log("Enhanced badge:", enhancedBadge);
    
    // Use badge_name for comparison instead of name
    setSelectedBadge(selectedBadge && selectedBadge.badge_name === enhancedBadge.badge_name ? null : enhancedBadge);
  };

  const closeModal = () => {
    setSelectedBadge(null);
  };

  if (!user) {
    return <div className="loading">Loading rewards...</div>;
  }

  return (
    <div className="rewards-container">
{selectedBadge && (
        <div className="badge-modal-overlay" onClick={closeModal}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="badge-modal-header">
              <h3>{selectedBadge.badge_name}</h3>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div className="badge-modal-content">
              {selectedBadge.unlocked ? (
                <img 
                  src={getIconPath(selectedBadge.icon)} 
                  alt={selectedBadge.badge_name} 
                  className="badge-large-image" 
                />
              ) : (
                <div className="badge-large-image locked-badge-large">
                  🔒
                </div>
              )}
              
              {selectedBadge.unlocked ? (
                <>
                  <p className="badge-description">
                    <strong>You've earned this badge!</strong>
                  </p>
                  <p className="badge-description">
                    {selectedBadge.description}
                  </p>
                </>
              ) : (
                <>
                  <p className="badge-description">
                    This badge is still locked. Complete the required tasks to earn it.
                  </p>
                  <div className="badge-criteria">
                    <h4>How to earn:</h4>
                    <p>{selectedBadge.badge_criteria || "Complete specific actions in the application to unlock this badge."}</p> 
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="rewards-title">🏆 Your Achievements</h2>
        <button onClick={handleRefresh} className="refresh-button"> 
          <span className = "refresh-icon">🔄</span>
          <span className = "refresh-text"> Refresh Badges</span>
        </button>
      </div>
      
      <div style={{ 
        padding: '10px', 
        marginTop: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        marginBottom: '15px'
      }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          <strong>Note:</strong> If you've completed habits and earned badges, click the Refresh button to see your latest achievements.
        </p>
      </div>

      <div className="section">
        <h3 className="section-title">🔓 Unlocked Badges ({earnedBadges.length})</h3>
        <div className="badges-grid">
          {earnedBadges.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No badges unlocked yet. Complete tasks to earn badges!</p>
          ) : (
            earnedBadges.map((badge, index) => (
              <div key={index} className="badge unlocked" title={badge.badge_name} onClick = {()=> handleBadgeClick(badge)}>
                <img
                  src={getIconPath(badge.icon)}
                  alt={badge.badge_name}
                  className="badge-icon"
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">📦 All Badges ({allBadges.length})</h3>
        <div className="badges-grid">
          {allBadges.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No badges available. Please check back later!</p>
          ) : (
            allBadges.map((badge, index) => (
              <div
                key={index}
                className={`badge ${badge.unlocked ? "unlocked" : "locked"}`}
                title={badge.badge_name}
                onClick={()=> handleBadgeClick(badge)}
              >
                {badge.unlocked ? (
                  <img
                    src={getIconPath(badge.icon)}
                    alt={badge.badge_name}
                    className="badge-icon"
                  />
                ) : (
                  <div className="locked-badge-icon">🔒</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Rewards;
