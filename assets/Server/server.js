const db = require('./config/db');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // Load environment variables

const authRoutes = require('./routes/authRoutes');
const habitRoutes = require("./routes/habitRoutes"); // Import habit routes
const badgeRoutes = require('./routes/badgeRoutes');
const progressRoutes = require('./routes/progressRoutes');
const weeklyProgressRoutes = require('./routes/weeklyProgressRoutes'); // Import weekly progress routes
const testRoutes = require('./routes/testRoutes'); // Import test routes


const app = express();
app.use(cors());
app.use(express.json()); // Express has built-in JSON parsing
// Serve static files from the client/dist directory (Vite uses 'dist' instead of 'build')
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use((req, res, next) => {
  console.log(`📌 Incoming request: ${req.method} ${req.url}`);
  next();
});


app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/badges', badgeRoutes);
app.use('/api/habits', habitRoutes); // Use habit routes
app.use('/api/habits/progress', progressRoutes);
app.use('/api/habits/progress/week', weeklyProgressRoutes); // Weekly progress endpoint
app.use('/api', testRoutes); // Test routes


// Main route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Direct weekly progress endpoint for Dashboard
app.get('/api/weekly-progress', async (req, res) => {
  console.log('📊 Direct weekly progress endpoint hit');
  
  try {
    // For now, just return test data to ensure the endpoint works
    const testData = [
      { day: 'Sun', completed: 2 },
      { day: 'Mon', completed: 3 },
      { day: 'Tue', completed: 1 },
      { day: 'Wed', completed: 4 },
      { day: 'Thu', completed: 2 },
      { day: 'Fri', completed: 5 },
      { day: 'Sat', completed: 0 }
    ];
    
    console.log('📊 Returning test data:', testData);
    res.json(testData);
  } catch (err) {
    console.error('❌ Error in direct weekly progress endpoint:', err);
    // Return test data even if there's an error
    const fallbackData = [
      { day: 'Sun', completed: 1 },
      { day: 'Mon', completed: 1 },
      { day: 'Tue', completed: 1 },
      { day: 'Wed', completed: 1 },
      { day: 'Thu', completed: 1 },
      { day: 'Fri', completed: 1 },
      { day: 'Sat', completed: 1 }
    ];
    res.json(fallbackData);
  }
});

// Direct endpoint for ProgressTab weekly data
app.get('/api/progress/weekly', async (req, res) => {
  console.log('📊 Progress Tab weekly data endpoint hit');
  
  try {
    // Return formatted data for the pie chart
    const weeklyData = {
      'Sun': 2,
      'Mon': 3,
      'Tue': 1,
      'Wed': 4,
      'Thu': 2,
      'Fri': 5,
      'Sat': 0
    };
    
    console.log('📊 Returning weekly data for progress tab:', weeklyData);
    res.json(weeklyData);
  } catch (err) {
    console.error('❌ Error in progress weekly endpoint:', err);
    // Return fallback data
    const fallbackData = {
      'Sun': 1,
      'Mon': 1,
      'Tue': 1,
      'Wed': 1,
      'Thu': 1,
      'Fri': 1,
      'Sat': 1
    };
    res.json(fallbackData);
  }
});

// Catch-all route to serve the React app for client-side routing
app.get('*', (req, res) => {
  // Skip API routes
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // For all other routes, serve the React app
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Set the port from environment variables or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
