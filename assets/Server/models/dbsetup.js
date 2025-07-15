const db = require('../config/db'); // Import database connection

// Create Users Table
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create Habits Table
const createHabitsTable = `
  CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    target_completion INT NOT NULL DEFAULT 7, -- Target days in a week
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`;

// Create Progress Table
const createProgressTable = `
  CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    habit_id INT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
  );
`;

// Execute Queries
db.query(createUsersTable, (err) => {
  if (err) console.error('Error creating users table:', err);
  else console.log('Users table created successfully!');
});

db.query(createHabitsTable, (err) => {
  if (err) console.error('Error creating habits table:', err);
  else console.log('Habits table created successfully!');
});

db.query(createProgressTable, (err) => {
  if (err) console.error('Error creating progress table:', err);
  else console.log('Progress table created successfully!');
});

db.end(); // Close database connection
