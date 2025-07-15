const Badge = require('../models/badgeModel');
const UserBadge = require('../models/userBadgeModel');
const { checkAndAwardBadges, awardRandomBadge } = require('../utils/badgeUtils');

// 🟡 Get all badges
const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.getAll();
    res.status(200).json(badges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch badges', error: err });
  }
};

// 🟢 Get badges for a user
const getUserBadges = async (req, res) => {
  const userId = req.user.id; // assuming middleware added user to req
  try {
    const badges = await UserBadge.getUserBadges(userId);
    res.status(200).json(badges);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user badges', error: err });
  }
};

// 🔵 New: Get all badges with user's unlocked status
const getAllBadgesWithUserStatus = async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ message: "Invalid userId" });

  try {
    const allBadges = await Badge.getAll();
    const userBadges = await UserBadge.getUserBadges(userId);

    // Debug info
    console.log("All badges from DB:", allBadges);
    console.log("User badges:", userBadges);

    const unlockedIds = new Set(
      Array.isArray(userBadges) ? userBadges.map(b => b.id) : []
    );

    const combined = allBadges.map(badge => ({
      id: badge.id,
      badge_name: badge.name,
      badge_description: badge.description,
      badge_criteria: badge.condition,
      icon: badge.icon,
      emoji: "🏆", // Hardcoded since the column doesn't exist
      unlocked: unlockedIds.has(badge.id),
    }));

    res.status(200).json(combined);
  } catch (err) {
    console.error("🚨 Failed to fetch badge data:", err);
    res.status(500).json({ message: 'Failed to fetch combined badge data', error: err });
  }
};

// 🟠 Check for newly earned badges
const checkForNewBadges = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`🔍 Received request to check badges for user ${userId}`);
  
  if (!userId) {
    console.log(`❌ Invalid userId provided: ${req.params.userId}`);
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    console.log(`🏆 Checking if user ${userId} has earned any new badges`);
    
    // Check if the user has earned any new badges
    const newBadge = await checkAndAwardBadges(userId);

    if (newBadge) {
      console.log(`🎉 User ${userId} earned a new badge:`, newBadge);
      
      // Make sure all required properties are present
      const badgeResponse = {
        earned: true,
        badge: {
          id: newBadge.id || 0,
          badge_name: newBadge.badge_name || "New Badge",
          badge_description: newBadge.badge_description || "You've earned a new achievement!",
          badge_criteria: newBadge.badge_criteria || "",
          icon: newBadge.icon || null,
          emoji: "🏆", // Hardcoded since the column doesn't exist
          unlocked: true
        }
      };
      
      console.log(`📤 Sending badge response:`, badgeResponse);
      return res.status(200).json(badgeResponse);
    } else {
      console.log(`ℹ️ No new badges earned for user ${userId}`);
      // No new badges earned
      return res.status(200).json({
        earned: false
      });
    }
  } catch (err) {
    console.error("🚨 Failed to check for new badges:", err);
    res.status(500).json({ message: 'Failed to check for new badges', error: err.message });
  }
};

// 🟣 Award a random motivation badge
const awardRandomMotivationBadge = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`🎲 Received request to award random badge for user ${userId}`);
  
  if (!userId) {
    console.log(`❌ Invalid userId provided: ${req.params.userId}`);
    return res.status(400).json({ message: "Invalid userId" });
  }

  try {
    console.log(`🎯 Attempting to award random motivation badge to user ${userId}`);
    
    // Award a random motivation badge
    const randomBadge = await awardRandomBadge(userId);

    if (randomBadge) {
      console.log(`🎉 User ${userId} earned a random badge:`, randomBadge);
      
      // Make sure all required properties are present
      const badgeResponse = {
        earned: true,
        badge: {
          id: randomBadge.id || 0,
          badge_name: randomBadge.badge_name || "Random Badge",
          badge_description: randomBadge.badge_description || "You've earned a random motivation badge!",
          badge_criteria: randomBadge.badge_criteria || "random_motivation",
          icon: randomBadge.icon || null,
          emoji: "🎲", // Hardcoded since the column doesn't exist
          unlocked: true
        }
      };
      
      console.log(`📤 Sending random badge response:`, badgeResponse);
      return res.status(200).json(badgeResponse);
    } else {
      console.log(`ℹ️ No random badges available for user ${userId} or error occurred`);
      // No random badges available or error occurred
      return res.status(200).json({
        earned: false
      });
    }
  } catch (err) {
    console.error("🚨 Failed to award random badge:", err);
    res.status(500).json({ message: 'Failed to award random badge', error: err.message });
  }
};

module.exports = {
  getAllBadges,
  getUserBadges,
  getAllBadgesWithUserStatus,
  checkForNewBadges,
  awardRandomMotivationBadge
};
