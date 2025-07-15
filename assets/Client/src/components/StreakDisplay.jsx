import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StreakDisplay = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your streak');
          setLoading(false);
          return;
        }

        // Try both URL formats to ensure compatibility
        let response;
        try {
          response = await axios.get('http://localhost:5000/api/habits/streak', {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (error) {
          response = await axios.get('/api/habits/streak', {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        setStreak(response.data.streak || 0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching streak:', err);
        setError('Failed to load streak data');
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  const containerStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    margin: '10px 0'
  };

  const streakStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  };

  const iconStyle = {
    color: 'orange',
    fontSize: '1.5rem',
    marginRight: '8px'
  };

  const numberStyle = {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    color: '#333'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <p>Loading streak data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h3 style={{ margin: '0 0 10px 0' }}>Your Current Streak</h3>
      <div style={streakStyle}>
        <span style={iconStyle}>🔥</span>
        <span style={numberStyle}>{streak}</span>
        <span style={{ marginLeft: '5px' }}>days</span>
      </div>
    </div>
  );
};

export default StreakDisplay;