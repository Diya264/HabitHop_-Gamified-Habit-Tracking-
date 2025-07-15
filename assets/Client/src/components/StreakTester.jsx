import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFire } from 'react-icons/fa';
import './StreakTester.css';

const StreakTester = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [habitId, setHabitId] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(false);

  // Fetch user's habits
  useEffect(() => {
    const fetchHabits = async () => {
      setLoadingHabits(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/habits/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHabits(response.data);
        if (response.data.length > 0) {
          setHabitId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching habits:', err);
        setError('Failed to load habits');
      } finally {
        setLoadingHabits(false);
      }
    };

    fetchHabits();
  }, []);

  // Fetch current streak
  const fetchStreak = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/habits/streak', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreak(response.data.streak);
      setTestResults(prev => [...prev, {
        type: 'Current Streak',
        result: response.data.streak,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err) {
      console.error('Error fetching streak:', err);
      setError('Failed to fetch streak');
      setTestResults(prev => [...prev, {
        type: 'Error',
        result: 'Failed to fetch streak',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Mark a habit as complete for today
  const markHabitComplete = async () => {
    if (!habitId) {
      setError('Please select a habit first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/habits/${habitId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTestResults(prev => [...prev, {
        type: 'Mark Complete',
        result: `Habit ID ${habitId} marked as complete`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Fetch updated streak after marking complete
      await fetchStreak();
    } catch (err) {
      console.error('Error marking habit complete:', err);
      setError('Failed to mark habit as complete');
      setTestResults(prev => [...prev, {
        type: 'Error',
        result: 'Failed to mark habit as complete',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Clear all habit logs for testing
  const clearHabitLogs = async () => {
    if (!habitId) {
      setError('Please select a habit first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/test/habit-logs/${habitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTestResults(prev => [...prev, {
        type: 'Clear Logs',
        result: `Habit logs cleared for habit ID ${habitId}`,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Fetch updated streak after clearing logs
      await fetchStreak();
    } catch (err) {
      console.error('Error clearing habit logs:', err);
      setError('Failed to clear habit logs');
      setTestResults(prev => [...prev, {
        type: 'Error',
        result: 'Failed to clear habit logs',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="streak-tester-card">
      <h2>Streak Tester</h2>
      
      <div className="streak-display">
        <FaFire className="streak-icon" />
        <h3>
          Current Streak: {loading ? "Loading..." : streak !== null ? streak : 'N/A'}
        </h3>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="habit-selector">
        <h4>Select a habit to test:</h4>
        {loadingHabits ? (
          <p>Loading habits...</p>
        ) : (
          <div className="habit-buttons">
            {habits.map((habit) => (
              <button
                key={habit.id}
                className={habitId === habit.id ? 'habit-button selected' : 'habit-button'}
                onClick={() => setHabitId(habit.id)}
              >
                {habit.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button
          className="check-streak-button"
          onClick={fetchStreak}
          disabled={loading}
        >
          Check Streak
        </button>
        <button
          className="mark-complete-button"
          onClick={markHabitComplete}
          disabled={loading || !habitId}
        >
          Mark Complete
        </button>
        <button
          className="clear-logs-button"
          onClick={clearHabitLogs}
          disabled={loading || !habitId}
        >
          Clear Logs
        </button>
      </div>

      <hr />
      
      <h3>Test Results:</h3>
      
      {testResults.length === 0 ? (
        <p className="no-results">No tests run yet</p>
      ) : (
        <div className="test-results">
          {testResults.map((result, index) => (
            <div key={index} className="result-item">
              <p className="result-timestamp">
                {result.timestamp} - {result.type}
              </p>
              <p className="result-value">
                {result.result}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakTester;