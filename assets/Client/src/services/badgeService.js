import axios from 'axios';

// Function to check if a user has earned any new badges based on their actions
export const checkForEarnedBadges = async (userId) => {
  try {
    console.log(`🔍 Checking for earned badges for user ${userId}`);
    const token = localStorage.getItem("token");
    if (!token) {
      console.log(`❌ No token found, cannot check for badges`);
      return { earned: false };
    }

    try {
      // Call the backend to check for badges
      console.log(`🔄 Calling backend to check for badges: /api/badges/check/${userId}`);
      const response = await axios.get(`http://localhost:5000/api/badges/check/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`✅ Badge check response:`, response.data);
      
      // If the user earned a new badge, return the badge data
      if (response.data && response.data.earned) {
        const newBadge = response.data.badge;
        console.log(`🎉 User earned a new badge from backend check:`, newBadge);
        
        return {
          earned: true,
          badge: newBadge
        };
      }

      console.log(`ℹ️ No new badges earned`);
      return { earned: false };
    } catch (error) {
      console.error(`❌ Error in badge check process:`, error);
      return { earned: false };
    }
  } catch (error) {
    console.error("❌ Error checking for earned badges:", error);
    return { earned: false };
  }
};

// Function to award a random motivation badge
export const checkForRandomBadge = async (userId) => {
  try {
    console.log(`🎲 Checking for random motivation badge for user ${userId}`);
    const token = localStorage.getItem("token");
    if (!token) {
      console.log(`❌ No token found, cannot check for random badges`);
      return { earned: false };
    }

    // Get the last random badge timestamp from localStorage
    const lastRandomBadgeTime = localStorage.getItem("lastRandomBadgeTime");
    const now = new Date().getTime();
    
    // Normal production logic
    if (lastRandomBadgeTime) {
      const daysSinceLastBadge = (now - parseInt(lastRandomBadgeTime)) / (1000 * 60 * 60 * 24);
      console.log(`⏱️ Days since last random badge: ${daysSinceLastBadge.toFixed(1)}`);
      
      if (daysSinceLastBadge < 18) {
        console.log(`⏱️ Not enough time has passed since last random badge (${daysSinceLastBadge.toFixed(1)} days)`);
        return { earned: false };
      }
    }
    
    // Random chance (about 20% chance each day after 18 days)
    if (Math.random() > 0.2) {
      console.log(`🎲 Random check failed, not awarding badge today`);
      return { earned: false };
    }

    try {
      // Call the backend endpoint to award a random motivation badge
      console.log(`🔄 Calling backend to award random badge: /api/badges/random/${userId}`);
      const response = await axios.post(`http://localhost:5000/api/badges/random/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`✅ Random badge response:`, response.data);

      // If a random badge was awarded, update the timestamp and return the badge data
      if (response.data && response.data.earned) {
        const newBadge = response.data.badge;
        console.log(`🎉 User earned a random badge:`, newBadge);
        
        // Update the timestamp for the last random badge
        localStorage.setItem("lastRandomBadgeTime", now.toString());
        
        return {
          earned: true,
          badge: newBadge
        };
      }
      
      console.log(`ℹ️ No random badge awarded`);
      return { earned: false };
    } catch (error) {
      console.error(`❌ Error in random badge process:`, error);
      return { earned: false };
    }
  } catch (error) {
    console.error("❌ Error in checkForRandomBadge function:", error);
    return { earned: false };
  }
};
