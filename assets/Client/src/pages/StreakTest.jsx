import React from 'react';
import StreakTester from '../components/StreakTester';
import { Link } from 'react-router-dom';

const StreakTest = () => {
  return (
    <div className="dashboard-container">
      <div className="simple-nav" style={{ display: "flex", gap: "20px", padding: "10px", background: "#f5f5f5" }}>
        <Link to="/">Dashboard</Link>
        <Link to="/login">Login</Link>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Streak Testing Page</h1>
          <p className="text-muted">
            using this page to test how the streak calculation works in my app.
          </p>
        </div>
        <StreakTester />
      </div>
    </div>
  );
};

export default StreakTest;
