const mysql = require("mysql2/promise");
require("dotenv").config(); // Load environment variables

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Allows multiple queries without issues
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Connected to MySQL Database!');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
}

testConnection(); // Call function to test connection

module.exports = db;




































































// const mysql = require("mysql2/promise");
// require("dotenv").config(); // Load environment variables

// // Create a MySQL connection pool
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10, // Adjust based on your needs
//   queueLimit: 0,
// });

// module.exports = db;






































// // const mysql = require('mysql2/promise');
// // require('dotenv').config(); // Load environment variables

// // // Create a database connection
// // const db = mysql.createConnection({
// //   host: process.env.DB_HOST,
// //   user: process.env.DB_USER,
// //   password: process.env.DB_PASS,
// //   database: process.env.DB_NAME,
// // });

// // // Connect to MySQL
// // db.connect((err) => {
// //   if (err) {
// //     console.error('Database connection failed:', err.message);
// //     return;
// //   }
// //   console.log('Connected to MySQL Database!');
// // });

// // module.exports = db;
