import axios from 'axios';

// Base URL for API requests
const API_URL = 'http://localhost:5000/api/habits';

// Variable to store mock mood for testing
let mockMood = null;
let isMocking = false;

// Listen for mock mood events and server-provided moods
window.addEventListener('refresh-pet-mood', (event) => {
  if (event.detail && event.detail.mockMood) {
    mockMood = event.detail.mockMood;
    isMocking = true;
    console.log(`🔄 moodService received mock mood: ${mockMood}`);
  }
  
  if (event.detail && event.detail.isMocking === false) {
    mockMood = null;
    isMocking = false;
    console.log('🔄 moodService cleared mock mood');
  }
  
  // Handle server-provided mood
  if (event.detail && event.detail.serverMood) {
    console.log(`🔄 moodService received server-provided mood: ${event.detail.serverMood}`);
  }
});

/**
 * Fetches the user's current mood based on habit performance
 * @param {string} cacheParam - Optional cache-busting parameter
 * @returns {Promise<string>} A promise that resolves to a mood string ('happy', 'sad', etc.)
 */
export const fetchUserMood = async (cacheParam = '') => {
  // If we're in mock mode, return the mock mood
  if (isMocking && mockMood) {
    console.log(`🔄 Returning mocked mood: ${mockMood}`);
    return mockMood;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot fetch mood');
      return null;
    }

    console.log('Fetching user mood from server...');
    
    // trying both URL formats to ensure compatibility
    let response;
    try {
      // Add cache-busting parameter to prevent caching
      response = await axios.get(`${API_URL}/mood${cacheParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.log('Falling back to relative URL for mood fetch');
      // Fallback to relative URL if the absolute URL fails
      response = await axios.get(`/api/habits/mood${cacheParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    console.log('🌟 Fetched user mood data:', response.data);
    
    // If the response includes streak info, log it
    if (response.data.streak !== undefined) {
      console.log(`🔥 User streak: ${response.data.streak}`);
    }
    
    // Log the mood we're returning
    console.log(`🌟 Returning mood: ${response.data.mood}`);
    
    return response.data.mood;
  } catch (error) {
    console.error('Error fetching user mood:', error);
    return null;
  }
};

/**
 * Maps the server mood values to pet component mood values
 * @param {string} serverMood - The mood value from the server ('super_happy', 'happy', 'content', 'sad', 'angry', 'neutral')
 * @returns {string} - The corresponding mood value for the pet component
 * 
 * Habit-based moods:
 * - excited: User has 6+ completions today (mapped from 'super_happy')
 * - happy: User has 2+ completions today or a streak of 3+
 * - curious: User has 1 completion today or a streak of 1-2
 * - sad: User missed habits yesterday
 * - angry: User hasn't completed any habits today
 * - idle: Default state when no other conditions are met
 * 
 * Interaction-only moods (can also be triggered by user interactions):
 * - excited: Can also be triggered by user interactions
 * - angry: Can also be triggered by user interactions
 * - sleeping: From long inactivity or user interactions
 */
export const mapServerMoodToPetMood = (serverMood) => {
  // Map server mood values to pet component mood values
  const moodMap = {
    'super_happy': 'excited', // User has 6+ completions today (super excited)
    'happy': 'happy',         // User has 2+ completions today or a streak of 3+
    'content': 'curious',     // User has 1 completion today or a streak of 1-2
    'sad': 'sad',             // User missed habits yesterday
    'angry': 'angry',         // User hasn't completed any habits today
    'neutral': 'idle',        // Default state
  };

  console.log(`Mapping server mood "${serverMood}" to pet mood "${moodMap[serverMood] || 'idle'}"`);
  return moodMap[serverMood] || 'idle'; // Default to 'idle' if no mapping exists
};

/**
 * Gets the status text for a given mood
 * @param {string} mood - The pet mood
 * @returns {string} - The status text to display
 */
export const getMoodStatusText = (mood) => {
  console.log(`Getting status text for mood: "${mood}"`);
  
  const statusTexts = {
    // Habit-based moods
    'happy': "Happy: Your pet is thrilled with your habit progress! (2+ habits completed today or 3+ day streak)",
    'curious': "Curious: Your pet is interested in your habit progress! (1 habit completed today or 1-2 day streak)",
    'sad': "Sad: Your pet is feeling blue because some habits were missed yesterday...",
    'idle': "Idle: Your pet is waiting for you to complete more habits!",
    'excited': "Excited: Your pet can't contain its joy! (6+ habits completed today or from interactions)",
    'angry': "Angry: Your pet is upset! (No habits completed today or from interactions)",
    'sleeping': "Sleeping: Shh... Your pet is taking a nap. (From long inactivity or interactions)"
  };

  // Add special handling for combined moods
  if (mood && mood.includes('look-left')) {
    const baseText = statusTexts[mood.replace(' look-left', '')] || "Your pet is looking to the left...";
    console.log(`Returning left-looking status: "${baseText} 👈"`);
    return baseText + " 👈";
  }
  
  if (mood && mood.includes('look-right')) {
    const baseText = statusTexts[mood.replace(' look-right', '')] || "Your pet is looking to the right...";
    console.log(`Returning right-looking status: "${baseText} 👉"`);
    return baseText + " 👉";
  }
  
  if (mood === 'happy-clicked') {
    console.log(`Returning happy-clicked status`);
    return "Happy: Your pet loves the attention! (This is a temporary mood from interaction)";
  }

  const result = statusTexts[mood] || "Your pet is watching your habit progress...";
  console.log(`Returning status text: "${result}" for mood "${mood}"`);
  return result;
};
