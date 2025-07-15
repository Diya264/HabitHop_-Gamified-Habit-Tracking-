import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import "./Register.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const response = await registerUser({ name, email, password });

    if (response.error) {
      setError(response.error);
    } else {
      alert("Registration Successful! You can now log in.");
      navigate("/login"); // Redirect to login page
    }
  };

  // Create animated stars in the background
  const createStars = () => {
    const stars = [];
    for (let i = 0; i < 30; i++) {
      const style = {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`
      };
      stars.push(<div key={i} className="star" style={style}></div>);
    }
    return stars;
  };

  return (
    <div className="habithop-body">
      <div className="stars">
        {createStars()}
      </div>
      
      <div className="container">
        <div className="left-panel">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          
          <div className="platform platform-1"></div>
          <div className="platform platform-2"></div>
          <div className="platform platform-3"></div>
          
          <div className="bunny-container">
            <div className="bunny">
              <div className="face">
                <div className="eyes">
                  <div className="eye"></div>
                  <div className="eye"></div>
                </div>
                <div className="nose"></div>
                <div className="mouth"></div>
                <div className="cheeks">
                  <div className="cheek"></div>
                  <div className="cheek"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="carrot"></div>
          
          <div className="logo-text">HabitHop</div>
          <div className="tagline">Build better habits, one hop at a time</div>
        </div>
        
        <div className="right-panel">
          <h2 className="register-title">Create Account</h2>
          <p className="welcome-text">Start your journey toward better habits</p>
          
          {error && <p style={{ color: "red", marginBottom: "15px" }}>{error}</p>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="text" 
                id="name" 
                placeholder="Your Name"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                required 
              />
              <label htmlFor="name">Full Name</label>
              <div className="form-icon">👤</div>
            </div>
            
            <div className="form-group">
              <input 
                type="email" 
                id="email" 
                placeholder="your@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label htmlFor="email">Email Address</label>
              <div className="form-icon">✉️</div>
            </div>
            
            <div className="form-group">
              <input 
                type={showPassword ? "text" : "password"}
                id="password" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label htmlFor="password">Password</label>
              <div className="form-icon" onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
                  {showPassword ? "🙈" : "🔒"}   
                </div>
            </div>
            
            <button type="submit">
              <span className="button-text">Register</span>
            </button>
          </form>
          
          <div className="options">
            <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Already have an account?</a>
          </div>
          
          <div className="social-login">
            <p>Or register with</p>
            <div className="social-icons">
              <div className="social-icon social-icon-g">G</div>
              <div className="social-icon social-icon-f">f</div>
              <div className="social-icon social-icon-a">in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
