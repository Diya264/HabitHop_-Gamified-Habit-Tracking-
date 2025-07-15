import axios from "axios";

const API_URL = "http://localhost:5000/api/habits";

// ✅ Add a habit
export const addHabit = async (habitData, token) => {
  const res = await axios.post(`${API_URL}/add`, habitData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Get all habits
export const getHabits = async (token) => {
  const res = await axios.get(`${API_URL}/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Update a habit
export const updateHabit = async (habitId, completed, token, type = null) => {
  console.log(`🔄 Updating habit ${habitId} to completed=${completed}${type ? `, type=${type}` : ''}`);
  
  const res = await axios.put(
    `${API_URL}/update/${habitId}`,
    { completed, type }, // Include type if provided
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  // We're no longer checking for badges here to avoid duplicate checks
  // Badge checking is now handled exclusively in the Habits component
  
  // Check if the response included a mood update
  if (res.data && res.data.mood) {
    console.log(`🐱 Server returned updated mood: ${res.data.mood}`);
  }
  
  return res.data;
};

// ✅ Delete a habit
export const deleteHabit = async (habitId, token) => {
  const res = await axios.delete(`${API_URL}/delete/${habitId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
