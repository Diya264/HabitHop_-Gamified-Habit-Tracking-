const db = require('../config/db');

// Helper to count habits completed in a row
const countHabitsInRow = async (userId) => {
  try {
    console.log(`🔢 Counting habits completed in a row for user ${userId}`);
    
    // Get all habits for the user with their completion status
    // Using a direct query to get habits with their completion status for today
    const [habits] = await db.query(
      `SELECT h.id, h.name, 
        CASE WHEN hl.completion_date IS NOT NULL AND DATE(hl.completion_date) = CURDATE() 
          THEN 1 ELSE 0 END as completed
       FROM habits h
       LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND DATE(hl.completion_date) = CURDATE()
       WHERE h.user_id = ?
       ORDER BY h.id ASC`,
      [userId]
    );
    
    console.log(`📋 Found ${habits.length} habits for user ${userId}`);
    
    // Debug: Log the raw habits data
    console.log(`📊 Raw habits data:`, JSON.stringify(habits, null, 2));
    
    // Count consecutive completed habits
    let consecutiveCount = 0;
    let maxConsecutiveCount = 0;
    
    for (const habit of habits) {
      // Debug: Log the habit's completed value and its type
      console.log(`- Habit ${habit.id} (${habit.name}): completed = ${habit.completed} (${typeof habit.completed})`);
      
      // Convert to boolean if it's a number or string
      const isCompleted = habit.completed === 1 || habit.completed === '1' || habit.completed === true;
      
      if (isCompleted) {
        consecutiveCount++;
        maxConsecutiveCount = Math.max(maxConsecutiveCount, consecutiveCount);
        console.log(`  ✅ Consecutive count: ${consecutiveCount}`);
      } else {
        consecutiveCount = 0;
        console.log(`  ❌ Streak broken, reset to 0`);
      }
    }
    
    console.log(`🔢 Max consecutive habits completed: ${maxConsecutiveCount}`);
    return maxConsecutiveCount;
  } catch (error) {
    console.error(`❌ Error counting habits in row for user ${userId}:`, error);
    return 0;
  }
};

// Helper to calculate max streak for a user
const calculateMaxStreak = async (userId) => {
  try {
    console.log(`🔍 Calculating max streak for user ${userId}`);
    
    // Get all completion dates for the user's daily habits
    const [rows] = await db.execute(
      `SELECT DISTINCT DATE(hl.completion_date) AS completed_day
       FROM habit_logs hl
       JOIN habits h ON hl.habit_id = h.id
       WHERE hl.user_id = ? AND hl.completion_date IS NOT NULL AND h.type = 'daily'
       ORDER BY completed_day DESC`,
      [userId]
    );

    console.log(`📅 Found ${rows.length} completion dates for user ${userId}`);
    
    if (rows.length === 0) {
      console.log(`ℹ️ No completion dates found, returning streak of 0`);
      return 0;
    }

    // Log the completion dates for debugging
    rows.forEach((row, index) => {
      console.log(`📆 Completion date ${index + 1}: ${row.completed_day}`);
    });

    // Calculate current streak
    let currentStreak = 1;
    
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
      console.log(`❌ Most recent completion (${mostRecentDate.toISOString().split('T')[0]}) is not from today or yesterday, current streak is 0`);
      currentStreak = 0;
    } else {
      // Start checking from the second most recent day
      let expectedDate = new Date(mostRecentDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
      
      for (let i = 1; i < rows.length; i++) {
        let completedDate = new Date(rows[i].completed_day);
        completedDate.setHours(0, 0, 0, 0);
        
        console.log(`🔍 Comparing dates: expected=${expectedDate.toISOString().split('T')[0]}, actual=${completedDate.toISOString().split('T')[0]}`);
        
        // Check if this date is the expected previous day
        if (completedDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          console.log(`🔥 Streak continues: ${currentStreak} days`);
          // Move expected date back by one day
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          // Streak is broken
          console.log(`❌ Streak broken after ${currentStreak} days`);
          break;
        }
      }
    }
    
    // Now calculate historical max streak
    // Sort dates in ascending order for this calculation
    rows.sort((a, b) => {
      return new Date(a.completed_day) - new Date(b.completed_day);
    });
    
    let maxStreak = 0;
    let historicalStreak = 1;
    
    for (let i = 1; i < rows.length; i++) {
      const prevDate = new Date(rows[i - 1].completed_day);
      const currDate = new Date(rows[i].completed_day);
      
      // Calculate the difference in days
      const diff = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        // Consecutive days
        historicalStreak++;
        maxStreak = Math.max(maxStreak, historicalStreak);
      } else if (diff > 1) {
        // Streak broken
        historicalStreak = 1;
      }
    }
    
    // Take the maximum of current streak and historical max streak
    const finalMaxStreak = Math.max(maxStreak, currentStreak);
    
    console.log(`📊 Max historical streak: ${maxStreak}, Current streak: ${currentStreak}, Final max streak: ${finalMaxStreak}`);
    
    return finalMaxStreak;
  } catch (error) {
    console.error(`❌ Error calculating max streak for user ${userId}:`, error);
    return 0;
  }
};

// Helper to log all badge conditions in the database
const logAllBadgeConditions = async () => {
  try {
    console.log(`📋 Logging all badge conditions in the database`);
    
    const [allBadges] = await db.query('SELECT id, name, badge_condition, description FROM badges');
    
    console.log(`🏆 Found ${allBadges.length} badges in the database:`);
    
    // Group badges by condition type
    const conditionGroups = {};
    
    allBadges.forEach(badge => {
      // Skip if condition is undefined
      if (!badge.badge_condition) {
        if (!conditionGroups['unknown']) {
          conditionGroups['unknown'] = [];
        }
        conditionGroups['unknown'].push({
          id: badge.id,
          name: badge.name,
          condition: 'undefined',
          description: badge.description
        });
        return;
      }
      
      const condition = badge.badge_condition;
      
      try {
        const conditionParts = condition.split('_');
        const conditionType = conditionParts[0];
      
        if (!conditionGroups[conditionType]) {
          conditionGroups[conditionType] = [];
        }
        
        conditionGroups[conditionType].push({
          id: badge.id,
          name: badge.name,
          condition: badge.badge_condition,
          description: badge.description
        });
      } catch (error) {
        console.error(`❌ Error processing badge condition:`, error);
        
        // Add to unknown group if there's an error
        if (!conditionGroups['unknown']) {
          conditionGroups['unknown'] = [];
        }
        conditionGroups['unknown'].push({
          id: badge.id,
          name: badge.name,
          condition: String(badge.badge_condition),
          description: badge.description
        });
      }
    });
    
    // Log each condition group
    Object.keys(conditionGroups).sort().forEach(groupName => {
      console.log(`\n📊 ${groupName.toUpperCase()} conditions (${conditionGroups[groupName].length}):`);
      conditionGroups[groupName].forEach(badge => {
        console.log(`  - Badge ${badge.id}: "${badge.name}" (${badge.condition})`);
      });
    });
    
    return allBadges;
  } catch (error) {
    console.error(`❌ Error logging badge conditions:`, error);
    return [];
  }
};

async function checkAndAwardBadges(userId) {
  try {
    console.log(`🔍 Checking badges for user ${userId}`);
    
    // Log all badge conditions on first run (for debugging)
    if (!global.badgeConditionsLogged) {
      await logAllBadgeConditions();
      global.badgeConditionsLogged = true;
    }
    
    // 1. Get user's earned badges
    const [earnedBadges] = await db.query(
      'SELECT badge_id FROM user_badges WHERE user_id = ?',
      [userId]
    );
    const earnedBadgeIds = earnedBadges.map(b => b.badge_id);
    console.log(`👤 User ${userId} has already earned these badges:`, earnedBadgeIds);

    // 2. Get all badges (without emoji column which doesn't exist)
    const [allBadges] = await db.query('SELECT id, name, badge_condition, description, icon FROM badges');
    console.log(`🏆 Total badges in system:`, allBadges.length);
    
    // Log badge conditions for debugging
    console.log(`🔍 Badge conditions in system:`);
    allBadges.forEach(badge => {
      console.log(`- Badge ${badge.id} (${badge.name}): condition = "${badge.badge_condition}"`);
    });

    // 3. Get total completions from habit_logs
    const [completionData] = await db.query(
      'SELECT COUNT(*) AS totalCompletions FROM habit_logs WHERE user_id = ? AND completion_date IS NOT NULL',
      [userId]
    );
    const totalCompletions = completionData[0].totalCompletions || 0;
    console.log(`✅ User ${userId} total habit completions:`, totalCompletions);

    // 4. Calculate user's max streak
    const maxStreak = await calculateMaxStreak(userId);
    console.log(`🔥 User ${userId} max streak:`, maxStreak);
    
    // 4b. Calculate consecutive habits completed
    const consecutiveHabits = await countHabitsInRow(userId);
    console.log(`🔢 User ${userId} consecutive habits completed:`, consecutiveHabits);

    // 5. Get weekly completions (last 7 days)
    const [weeklyData] = await db.query(
      `SELECT COUNT(*) AS weeklyCompletions 
       FROM habit_logs 
       WHERE user_id = ? 
       AND completion_date IS NOT NULL 
       AND completion_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [userId]
    );
    const weeklyCompletions = weeklyData[0].weeklyCompletions || 0;
    console.log(`📅 User ${userId} weekly completions (last 7 days):`, weeklyCompletions);

    // 6. Badge awarding logic
    let newlyEarnedBadge = null;
    console.log(`🎯 Starting badge evaluation for user ${userId}`);

    for (const badge of allBadges) {
      // Skip if user already has this badge
      const alreadyEarned = earnedBadgeIds.includes(badge.id);
      if (alreadyEarned) {
        console.log(`⏭️ Badge ${badge.id} (${badge.name}) already earned, skipping`);
        continue;
      }

      // Skip if condition is undefined or null
      if (!badge.badge_condition) {
        console.log(`⚠️ Badge ${badge.id} (${badge.name}) has no condition, skipping`);
        continue;
      }

      const condition = badge.badge_condition;
      let earned = false;
      console.log(`🔍 Evaluating badge ${badge.id} (${badge.name}) with condition "${condition}"`);

      // Process the badge condition
      try {
        const conditionParts = condition.split('_');
        
        // First habit completion
        if (condition === 'first_habit' && totalCompletions >= 1) {
          earned = true;
          console.log(`✅ First habit condition met: ${totalCompletions} >= 1`);
        }
        
        // Handle streak conditions (streak_X_days)
        else if (conditionParts[0] === 'streak' && !isNaN(parseInt(conditionParts[1]))) {
          const requiredDays = parseInt(conditionParts[1]);
          if (maxStreak >= requiredDays) {
            earned = true;
            console.log(`✅ ${requiredDays}-day streak condition met: ${maxStreak} >= ${requiredDays}`);
          }
        }
        
        // Handle completion conditions (complete_X)
        else if (conditionParts[0] === 'complete' && !isNaN(parseInt(conditionParts[1]))) {
          const requiredCompletions = parseInt(conditionParts[1]);
          if (totalCompletions >= requiredCompletions) {
            earned = true;
            console.log(`✅ ${requiredCompletions} completions condition met: ${totalCompletions} >= ${requiredCompletions}`);
          }
        }
        
        // Handle weekly completion conditions (weekly_X)
        else if (conditionParts[0] === 'weekly' && !isNaN(parseInt(conditionParts[1]))) {
          const requiredWeeklyCompletions = parseInt(conditionParts[1]);
          if (weeklyCompletions >= requiredWeeklyCompletions) {
            earned = true;
            console.log(`✅ Weekly ${requiredWeeklyCompletions} completions condition met: ${weeklyCompletions} >= ${requiredWeeklyCompletions}`);
          }
        }
        
        // Handle consecutive habits conditions (habit_X_row)
        else if (conditionParts[0] === 'habit' && !isNaN(parseInt(conditionParts[1])) && conditionParts[2] === 'row') {
          const requiredConsecutiveHabits = parseInt(conditionParts[1]);
          
          console.log(`🔍 Checking habit_${requiredConsecutiveHabits}_row condition: ${consecutiveHabits} >= ${requiredConsecutiveHabits}`);
          
          if (consecutiveHabits >= requiredConsecutiveHabits) {
            earned = true;
            console.log(`✅ ${requiredConsecutiveHabits} habits in a row condition met: ${consecutiveHabits} >= ${requiredConsecutiveHabits}`);
          }
        }
        
        // Don't automatically award random_motivation badges here
        else if (condition === 'random_motivation') {
          console.log(`⏭️ Random motivation badge, skipping in regular check`);
          continue;
        }
        
        // Handle any other condition format
        else {
          console.log(`❓ Checking unknown badge condition: "${condition}"`);
          
          // Try to extract numbers from the condition
          const numbers = condition.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const num = parseInt(numbers[0]);
          
            // Try to guess what the condition might be about based on keywords
            if (condition.includes('streak')) {
              if (maxStreak >= num) {
                earned = true;
                console.log(`✅ Inferred streak condition met: ${maxStreak} >= ${num}`);
              }
            } 
            else if (condition.includes('complet') || condition.includes('finish') || condition.includes('done')) {
              if (totalCompletions >= num) {
                earned = true;
                console.log(`✅ Inferred completion condition met: ${totalCompletions} >= ${num}`);
              }
            } 
            else if (condition.includes('week') || condition.includes('day') || condition.includes('daily')) {
              if (weeklyCompletions >= num) {
                earned = true;
                console.log(`✅ Inferred weekly condition met: ${weeklyCompletions} >= ${num}`);
              }
            } 
            else if (condition.includes('row') || condition.includes('consecutive') || condition.includes('sequence')) {
              if (consecutiveHabits >= num) {
                earned = true;
                console.log(`✅ Inferred consecutive condition met: ${consecutiveHabits} >= ${num}`);
              }
            }
            // If we can't determine the type but there's a number, try all metrics
            else {
              console.log(`⚠️ Unknown condition type with number ${num}, trying all metrics`);
              
              if (maxStreak >= num) {
                earned = true;
                console.log(`✅ Trying streak: ${maxStreak} >= ${num}`);
              }
              else if (totalCompletions >= num) {
                earned = true;
                console.log(`✅ Trying completions: ${totalCompletions} >= ${num}`);
              }
              else if (weeklyCompletions >= num) {
                earned = true;
                console.log(`✅ Trying weekly: ${weeklyCompletions} >= ${num}`);
              }
              else if (consecutiveHabits >= num) {
                earned = true;
                console.log(`✅ Trying consecutive: ${consecutiveHabits} >= ${num}`);
              }
            }
          }
          else {
            // Handle conditions without numbers
            console.log(`⚠️ Condition "${condition}" has no numeric threshold, using default values`);
            
            // Special cases for conditions without numbers
            if (condition.includes('first') || condition.includes('start')) {
              if (totalCompletions >= 1) {
                earned = true;
                console.log(`✅ First/start condition met: ${totalCompletions} >= 1`);
              }
            }
            else if (condition.includes('week') || condition.includes('daily')) {
              if (weeklyCompletions >= 1) {
                earned = true;
                console.log(`✅ Weekly condition with no threshold met: ${weeklyCompletions} >= 1`);
              }
            }
            else if (condition.includes('streak')) {
              if (maxStreak >= 2) {
                earned = true;
                console.log(`✅ Streak condition with no threshold met: ${maxStreak} >= 2`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing condition "${condition}" for badge ${badge.id}:`, error);
        continue; // Skip this badge and move to the next one
      }

      if (earned) {
        console.log(`🏅 Badge ${badge.id} (${badge.name}) conditions met, awarding to user ${userId}`);
        
        try {
          await db.query(
            'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())',
            [userId, badge.id]
          );
          console.log(`✅ Successfully inserted badge ${badge.id} for user ${userId} in database`);
          
          // Get the full badge details to return (without emoji column which doesn't exist)
          const [badgeDetails] = await db.query(
            'SELECT id, name, description, badge_condition, icon FROM badges WHERE id = ?',
            [badge.id]
          );
          
          if (badgeDetails.length > 0) {
            console.log(`📝 Retrieved full badge details for badge ${badge.id}`);
            newlyEarnedBadge = {
              id: badgeDetails[0].id,
              badge_name: badgeDetails[0].name || "New Badge",
              badge_description: badgeDetails[0].description || "You've earned a new achievement!",
              badge_criteria: badgeDetails[0].badge_condition || "",
              icon: badgeDetails[0].icon || null,
              emoji: "🏆", // Hardcoded since the column doesn't exist
              unlocked: true
            };
            
            console.log(`🏆 Created badge object to return:`, newlyEarnedBadge);
            
            console.log(`🎉 Returning newly earned badge:`, newlyEarnedBadge);
            // Only return the first badge earned in this check
            break;
          }
        } catch (error) {
          console.error(`❌ Error awarding badge ${badge.id} to user ${userId}:`, error);
          
          // If it's a duplicate entry error, just continue
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️ Badge ${badge.id} already awarded to user ${userId}, continuing`);
            continue;
          }
        }
      } else {
        console.log(`❌ Conditions not met for badge ${badge.id} (${badge.name})`);
      }
    }
    
    if (newlyEarnedBadge) {
      console.log(`🎉 User ${userId} earned a new badge: ${newlyEarnedBadge.badge_name}`);
      return {
        earned: true,
        badge: newlyEarnedBadge
      };
    } else {
      console.log(`ℹ️ User ${userId} did not earn any new badges`);
      return {
        earned: false
      };
    }
  } catch (err) {
    console.error(`❌ Error checking badges for user ${userId}:`, err);
    return {
      earned: false,
      error: err.message
    };
  }
}

// Function to award a random motivation badge
async function awardRandomBadge(userId) {
  try {
    console.log(`🎲 Attempting to award a random motivation badge to user ${userId}`);
    
    // 1. Get user's earned badges
    const [earnedBadges] = await db.query(
      'SELECT badge_id FROM user_badges WHERE user_id = ?',
      [userId]
    );
    const earnedBadgeIds = earnedBadges.map(b => b.badge_id);
    console.log(`👤 User ${userId} has already earned these badges:`, earnedBadgeIds);

    // 2. Get all random motivation badges (without emoji column which doesn't exist)
    const [randomBadges] = await db.query(
      'SELECT id, name, description, badge_condition, icon FROM badges WHERE badge_condition = ?',
      ['random_motivation']
    );
    console.log(`🎲 Found ${randomBadges.length} random motivation badges`);
    
    if (randomBadges.length === 0) {
      console.log(`⚠️ No random motivation badges found in the database`);
      return null;
    }
    
    // 3. Filter out badges the user already has
    const availableBadges = randomBadges.filter(badge => !earnedBadgeIds.includes(badge.id));
    console.log(`🎯 ${availableBadges.length} random badges available to award`);
    
    if (availableBadges.length === 0) {
      console.log(`ℹ️ User ${userId} has already earned all random motivation badges`);
      return null;
    }
    
    // 4. Select a random badge from the available ones
    const randomIndex = Math.floor(Math.random() * availableBadges.length);
    const selectedBadge = availableBadges[randomIndex];
    console.log(`🎯 Selected random badge: ${selectedBadge.id} (${selectedBadge.name})`);
    
    // 5. Award the badge to the user
    try {
      await db.query(
        'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())',
        [userId, selectedBadge.id]
      );
      console.log(`✅ Successfully awarded random badge ${selectedBadge.id} to user ${userId}`);
      
      // 6. Return the badge details
      return {
        id: selectedBadge.id,
        badge_name: selectedBadge.name || "Random Badge",
        badge_description: selectedBadge.description || "You've earned a random motivation badge!",
        badge_criteria: selectedBadge.badge_condition || "random_motivation",
        icon: selectedBadge.icon || null,
        emoji: "🎲", // Hardcoded since the column doesn't exist
        unlocked: true
      };
    } catch (error) {
      console.error(`❌ Error awarding random badge ${selectedBadge.id} to user ${userId}:`, error);
      
      // If it's a duplicate entry error, try another badge
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`⚠️ Badge ${selectedBadge.id} already awarded to user ${userId}, trying another`);
        // Remove this badge from the available list and try again
        const newAvailableBadges = availableBadges.filter(b => b.id !== selectedBadge.id);
        if (newAvailableBadges.length > 0) {
          const newRandomIndex = Math.floor(Math.random() * newAvailableBadges.length);
          const newSelectedBadge = newAvailableBadges[newRandomIndex];
          
          try {
            await db.query(
              'INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES (?, ?, NOW())',
              [userId, newSelectedBadge.id]
            );
            console.log(`✅ Successfully awarded alternative random badge ${newSelectedBadge.id} to user ${userId}`);
            
            return {
              id: newSelectedBadge.id,
              badge_name: newSelectedBadge.name || "Random Badge",
              badge_description: newSelectedBadge.description || "You've earned a random motivation badge!",
              badge_criteria: newSelectedBadge.badge_condition || "random_motivation",
              icon: newSelectedBadge.icon || null,
              emoji: "🎲", // Hardcoded since the column doesn't exist
              unlocked: true
            };
          } catch (innerError) {
            console.error(`❌ Error awarding alternative random badge:`, innerError);
            return null;
          }
        } else {
          console.log(`ℹ️ No more random badges available to award to user ${userId}`);
          return null;
        }
      }
      
      return null;
    }
  } catch (error) {
    console.error(`❌ Error in awardRandomBadge for user ${userId}:`, error);
    return null;
  }
}

// Export the functions
module.exports = {
  countHabitsInRow,
  calculateMaxStreak,
  logAllBadgeConditions,
  checkAndAwardBadges,
  awardRandomBadge
};
