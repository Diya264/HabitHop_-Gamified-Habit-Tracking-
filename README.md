# HabitHop – Gamified Habit Tracker

HabitHop is a productivity-focused web application designed to help users build and maintain habits through engaging features such as streak tracking, progress visualization, rewards, and motivational elements.

## Features
-  **Habit Tracking:** Add, update, and monitor habits with detailed progress statistics.
-  **Streaks & Achievements:** View overall and individual habit streaks, and unlock achievements for consistency.
-  **Interactive Virtual Pet:** A virtual pet whose mood dynamically reflects your progress, providing instant feedback.
-  **Rewards System:** Earn rewards as you maintain habits to stay motivated.
-  **Fortune Cookie Insights:** Receive a daily motivational message for encouragement.
-  **Responsive Design:** Optimized for both desktop and mobile devices.

## Tech Stack
- **Frontend:** React, HTML5, CSS3, JavaScript, Axios for API calls
- **Backend:** Node.js, Express.js, MySQL (via database configuration in `db.js`)
- **Database:** MySQL
- **Version Control:** GitHub

##  Folder Structure
- HabitHop/
- ├── client/ # React frontend
- │ ├── public/ # Public assets (badges, icons, etc.)
- │ ├── src/
- │ │ ├── api/ # API helper services (auth.js, habitService.js)
- │ │ ├── components/ # Reusable UI components (Navbar, Pet, StreakDisplay, etc.)
- │ │ ├── pages/ # Main app views (Dashboard, Habits, Rewards, etc.)
- │ │ ├── services/ # Business logic services (badgeService, moodService)
- │ │ ├── styles/ # Component-specific CSS
- │ │ ├── App.jsx # Main App component
- │ │ └── main.jsx # Entry point
- │ └── package.json
- │
- ├── server/ # Node.js backend
- │ ├── config/ # Database configuration (db.js)
- │ ├── controllers/ # Request handlers (habitController, badgeController, etc.)
- │ ├── middleware/ # Authentication and other middleware
- │ ├── models/ # Database models (user, badge, etc.)
- │ ├── routes/ # API routes (authRoutes, habitRoutes, etc.)
- │ ├── utils/ # Utility functions (moodUtils, badgeUtils)
- │ ├── server.js # Backend entry point
- │ └── package.json
- │
- ├── README.md # Project documentation
- └── .gitignore


## Installation & Setup
> **Prerequisite:** Make sure you have Node.js and MySQL installed.

###  Clone the repository
```bash
git clone https://github.com/<your-username>/HabitHop.git
cd HabitHop
```

###  Set up the backend
- cd server
- npm install
#### Start the backend
- npm start

### Set up the frontend
- cd ../client
- npm install
- npm run dev

### Access the Application
- Open your browser and go to
- http://localhost:5173
> [!Note] Port may vary depending on your setup.

