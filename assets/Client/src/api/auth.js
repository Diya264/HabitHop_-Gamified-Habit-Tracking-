import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data; // Return success message
  } catch (error) {
    return { error: error.response?.data?.message || "Something went wrong" };
  }
};

// Login user
export const loginUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data; // Return token & user info
  } catch (error) {
    return { error: error.response?.data?.message || "Invalid credentials" };
  }
};
