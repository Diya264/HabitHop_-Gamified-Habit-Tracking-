const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find user by email
  findByEmail: async (email) => {
    try {
      const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return results[0];
    } catch (err) {
      throw err;
    }
  },

  // Create a new user
  create: async (name, email, password) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [results] = await db.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      return results;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = User;


































// const db = require('../config/db');
// const bcrypt = require('bcryptjs');

// const User = {
//   // Find user by email
//   findByEmail: (email) => {
//     return new Promise((resolve, reject) => {
//       db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
//         if (err) reject(err);
//         resolve(results[0]); // Return first user found (or undefined)
//       });
//     });
//   },

//   // Create a new user
//   create: (name, email, password) => {
//     return new Promise(async (resolve, reject) => {
//       try {
//         const hashedPassword = await bcrypt.hash(password, 10); // Hash password
//         db.query(
//           'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
//           [name, email, hashedPassword],
//           (err, results) => {
//             if (err) reject(err);
//             resolve(results);
//           }
//         );
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
// };

// module.exports = User;














































// const db = require('../config/db');
// const bcrypt = require('bcryptjs');

// class User {
//   static async create(name, email, password) {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return new Promise((resolve, reject) => {
//       const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
//       db.query(query, [name, email, hashedPassword], (err, result) => {
//         if (err) return reject(err);
//         resolve(result);
//       });
//     });
//   }

//   static async findByEmail(email) {
//     return new Promise((resolve, reject) => {
//       const query = 'SELECT * FROM users WHERE email = ?';
//       db.query(query, [email], (err, results) => {
//         if (err) return reject(err);
//         resolve(results[0]);
//       });
//     });
//   }
// }

// module.exports = User;
