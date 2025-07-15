const db = require('../config/db');

const UserBadge = {
  getUserBadges: async (userId) => {
    try {
      const [results] = await db.query(
        'SELECT b.* FROM user_badges ub JOIN badges b ON ub.badge_id = b.id WHERE ub.user_id = ?',
        [userId]
      );
      return results || [];
    } catch (err) {
      throw err;
    }
  },

  assignBadge: async (userId, badgeId) => {
    try {
      const [result] = await db.query(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badgeId]
      );
      return result;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = UserBadge;
