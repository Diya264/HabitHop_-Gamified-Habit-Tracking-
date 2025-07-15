const db = require('../config/db');

const Badge = {
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM badges');
      return results;
    } catch (err) {
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM badges WHERE id = ?', [id]);
      return results[0];
    } catch (err) {
      throw err;
    }
  },
};

module.exports = Badge;
