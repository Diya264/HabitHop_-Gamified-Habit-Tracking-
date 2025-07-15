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
- create an .env file to store your database credentials
#### Start the backend
- npm start

### Set up the frontend
- cd ../client
- npm install
- npm run dev

### Access the Application
- Open your browser and go to
- http://localhost:5173
> [!Note]
> Port may vary depending on your setup.

## Screenshots
 ### Login page 
 <img width="1365" height="589" alt="image" src="https://github.com/user-attachments/assets/d7dbc75c-a13e-45ef-9299-fb5cbceed675" />
 ### Signup page (design is similar to the login page)
 
 ### Dashboard 
<img width="1352" height="589" alt="image" src="https://github.com/user-attachments/assets/e78bfa1b-6537-404c-8fdd-98f8220ffc3c" />
<img width="1365" height="589" alt="image" src="https://github.com/user-attachments/assets/f2dd32d2-c6b0-41a0-adcc-3452657c3a87" />

 ### Habits Tab
 <img width="1339" height="584" alt="image" src="https://github.com/user-attachments/assets/d17b5181-b27b-452b-8bdd-10df8e08d6f9" />

 ### Progress Tab
 <img width="1352" height="585" alt="image" src="https://github.com/user-attachments/assets/6740ca1b-5f4f-4536-869c-ba93b80b6b67" />
 <img width="1359" height="557" alt="image" src="https://github.com/user-attachments/assets/0ed50e30-0b7c-48bb-b9a0-5b7647f096d9" />

 ### Pet Tab (the pet is interactive, it responds to your clicks)
 <img width="1365" height="581" alt="image" src="https://github.com/user-attachments/assets/26e9ce77-81dd-4177-a5fc-8c4d41c323c7" />

### Rewards Tab (Badges are expandable)
<img width="1358" height="595" alt="image" src="https://github.com/user-attachments/assets/4db8d317-1fcb-469c-a2a9-dd769bd618ab" />

### Fortune Cookie Tab (includes animations)
<img width="1363" height="595" alt="image" src="https://github.com/user-attachments/assets/1e65bc1c-7a5b-4feb-8336-1c092b44ab55" />
