import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    if (localStorage.getItem("token")) {
      setIsLoggedIn(true);
    }
    
    // Create animated stars in the background
    const starsContainer = document.querySelector('.stars');
    if (starsContainer) {
      for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsContainer.appendChild(star);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const response = await loginUser({ email, password });

    if (response.error) {
      setError(response.error);
    } else {
      localStorage.setItem("token", response.token); // Store token
      setIsLoggedIn(true);
      navigate("/dashboard"); // Redirect to dashboard
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Bunny animation effect
  const handleBunnyHover = (e) => {
    const bunny = e.currentTarget;
    bunny.style.animationName = 'bounce';
    setTimeout(() => {
      bunny.style.animationName = 'hop';
    }, 1000);
  };

  return (
    <div className="login-page">
      <style>{`
        /* CSS Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Comic Sans MS', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes hop {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-20px); }
          60% { transform: translateY(-10px); }
        }
        
        .login-page {
          background-color:rgb(173, 188, 209);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-image: 
            radial-gradient(circle at 10% 20%, rgba(100, 130, 255, 0.1) 0%, rgba(150, 180, 210, 0.1) 50%, rgba(220, 230, 240, 0.1) 100%);
          overflow: hidden;
          padding: 15px;
        }
        
        .stars {
          position: absolute;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        
        .star {
          position: absolute;
          background-color: #FFF;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          animation: float 3s infinite ease-in-out;
          box-shadow: 0 0 3px #FFF, 0 0 5px #FFF;
        }
        
        .container {
          display: flex;
          width: 100%;
          max-width: 900px;
          min-height: 550px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
          border-radius: 24px;
          overflow: hidden;
          background-color: white;
          position: relative;
          z-index: 1;
          flex-direction: row;
        }
        
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            min-height: auto;
          }
        }
        
        .left-panel {
          flex: 1;
          background: linear-gradient(135deg, #3F87E5, #4EADEE, #65D6E4);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
          min-height: 360px;
        }
        
        @media (max-width: 768px) {
          .left-panel {
            padding: 40px 20px 60px;
          }
        }
        
        @media (max-width: 480px) {
          .left-panel {
            min-height: 320px;
            padding: 30px 15px 50px;
          }
        }
        
        .cloud {
          position: absolute;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
        }
        
        .cloud-1 {
          width: 100px;
          height: 50px;
          top: 20%;
          left: 20%;
        }
        
        .cloud-2 {
          width: 150px;
          height: 70px;
          bottom: 30%;
          right: 10%;
        }
        
        .cloud-3 {
          width: 80px;
          height: 40px;
          top: 60%;
          left: 10%;
        }
        
        @media (max-width: 480px) {
          .cloud-1 {
            width: 80px;
            height: 40px;
          }
          .cloud-2 {
            width: 120px;
            height: 55px;
          }
          .cloud-3 {
            width: 60px;
            height: 30px;
          }
        }
        
        .bunny-container {
          margin-bottom: 30px;
          animation: hop 2s infinite ease-in-out;
          z-index: 2;
          position: relative;
          height: 150px;
          width: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        @media (max-width: 768px) {
          .bunny-container {
            margin-bottom: 20px;
            height: 130px;
          }
        }
        
        @media (max-width: 480px) {
          .bunny-container {
            height: 110px;
            width: 100px;
          }
        }
        
        .bunny {
          width: 120px;
          height: 120px;
          background-color: white;
          border-radius: 50%;
          position: relative;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .bunny {
            width: 110px;
            height: 110px;
          }
        }
        
        @media (max-width: 480px) {
          .bunny {
            width: 90px;
            height: 90px;
          }
        }
        
        .bunny::before, .bunny::after {
          content: '';
          position: absolute;
          background-color: white;
          width: 35px;
          height: 70px;
          border-radius: 40% 40% 25% 25%;
          top: -45px;
          box-shadow: 0 5px 10px rgba(0,0,0,0.05);
        }
        
        @media (max-width: 768px) {
          .bunny::before, .bunny::after {
            width: 30px;
            height: 60px;
            top: -40px;
          }
        }
        
        @media (max-width: 480px) {
          .bunny::before, .bunny::after {
            width: 25px;
            height: 50px;
            top: -35px;
          }
        }
        
        .bunny::before {
          left: 20px;
          transform: rotate(-10deg);
        }
        
        .bunny::after {
          right: 20px;
          transform: rotate(10deg);
        }
        
        @media (max-width: 480px) {
          .bunny::before {
            left: 15px;
          }
          .bunny::after {
            right: 15px;
          }
        }
        
        .face {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .eyes {
          position: relative;
          top: 40px;
          display: flex;
          justify-content: space-around;
          width: 80%;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .eyes {
            top: 35px;
          }
        }
        
        @media (max-width: 480px) {
          .eyes {
            top: 30px;
          }
        }
        
        .eye {
          width: 20px;
          height: 30px;
          background-color: #333;
          border-radius: 50%;
          position: relative;
        }
        
        @media (max-width: 768px) {
          .eye {
            width: 18px;
            height: 25px;
          }
        }
        
        @media (max-width: 480px) {
          .eye {
            width: 16px;
            height: 22px;
          }
        }
        
        .eye::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          top: 5px;
          left: 3px;
        }
        
        @media (max-width: 768px) {
          .eye::after {
            width: 7px;
            height: 7px;
            top: 4px;
            left: 2px;
          }
        }
        
        @media (max-width: 480px) {
          .eye::after {
            width: 6px;
            height: 6px;
            top: 3px;
            left: 2px;
          }
        }
        
        .nose {
          width: 15px;
          height: 10px;
          background-color: #FF9191;
          border-radius: 50%;
          position: absolute;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        @media (max-width: 768px) {
          .nose {
            width: 14px;
            height: 9px;
            top: 55px;
          }
        }
        
        @media (max-width: 480px) {
          .nose {
            width: 12px;
            height: 8px;
            top: 45px;
          }
        }
        
        .mouth {
          width: 30px;
          height: 10px;
          border-bottom: 2px solid #333;
          border-radius: 50%;
          position: absolute;
          top: 75px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        @media (max-width: 768px) {
          .mouth {
            width: 28px;
            top: 67px;
          }
        }
        
        @media (max-width: 480px) {
          .mouth {
            width: 25px;
            top: 55px;
            border-bottom: 1.5px solid #333;
          }
        }
        
        .cheeks {
          position: relative;
          top: 65px;
          display: flex;
          justify-content: space-around;
          width: 100%;
        }
        
        @media (max-width: 768px) {
          .cheeks {
            top: 60px;
          }
        }
        
        @media (max-width: 480px) {
          .cheeks {
            top: 50px;
          }
        }
        
        .cheek {
          width: 15px;
          height: 8px;
          background-color: #FF9191;
          border-radius: 50%;
          opacity: 0.4;
        }
        
        @media (max-width: 480px) {
          .cheek {
            width: 12px;
            height: 6px;
          }
        }
        
        .platform {
          width: 230px;
          height: 40px;
          border-radius: 50%;
          position: absolute;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .platform {
            width: 180px;
            height: 30px;
          }
        }
        
        @media (max-width: 480px) {
          .platform {
            width: 150px;
            height: 25px;
          }
        }
        
        .platform-1 {
          background-color: rgba(78, 173, 238, 0.8);
          bottom: 80px;
          left: 20px;
        }
        
        .platform-2 {
          background-color: rgba(63, 135, 229, 0.8);
          bottom: 160px;
          right: 20px;
        }
        
        .platform-3 {
          background-color: rgba(101, 214, 228, 0.8);
          bottom: 240px;
          left: 50px;
        }
        
        @media (max-width: 768px) {
          .platform-1 {
            bottom: 60px;
            left: 15px;
          }
          .platform-2 {
            bottom: 120px;
            right: 15px;
          }
          .platform-3 {
            bottom: 180px;
            left: 35px;
          }
        }
        
        @media (max-width: 480px) {
          .platform-1 {
            bottom: 50px;
            left: 10px;
          }
          .platform-2 {
            bottom: 100px;
            right: 10px;
          }
          .platform-3 {
            bottom: 150px;
            left: 25px;
          }
        }
        
        .logo-text {
          font-size: 38px;
          font-weight: bold;
          margin-top: 20px;
          color: white;
          text-shadow: 0px 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 2;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .logo-text {
            font-size: 32px;
            margin-top: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .logo-text {
            font-size: 28px;
            margin-top: 10px;
          }
        }
        
        .tagline {
          font-size: 18px;
          margin-top: 10px;
          color: rgba(255,255,255,0.9);
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 0 10px;
        }
        
        @media (max-width: 768px) {
          .tagline {
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .tagline {
            font-size: 14px;
            margin-top: 8px;
          }
        }
        
        .right-panel {
          flex: 1;
          background-color: white;
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        @media (max-width: 768px) {
          .right-panel {
            padding: 30px 20px;
          }
        }
        
        @media (max-width: 480px) {
          .right-panel {
            padding: 25px 15px;
          }
        }
        
        h2 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #3F87E5;
        }
        
        @media (max-width: 768px) {
          h2 {
            font-size: 24px;
          }
        }
        
        @media (max-width: 480px) {
          h2 {
            font-size: 22px;
          }
        }
        
        .welcome-text {
          color: #666;
          margin-bottom: 30px;
          font-size: 16px;
        }
        
        @media (max-width: 768px) {
          .welcome-text {
            margin-bottom: 20px;
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .welcome-text {
            margin-bottom: 15px;
            font-size: 14px;
          }
        }
        
        .form-group {
          margin-bottom: 25px;
          position: relative;
        }
        
        @media (max-width: 768px) {
          .form-group {
            margin-bottom: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .form-group {
            margin-bottom: 15px;
          }
        }
        
        .form-group input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #E0E0E0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s;
          background-color: #F9F9F9;
        }
        
        @media (max-width: 768px) {
          .form-group input {
            padding: 12px 15px;
            font-size: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .form-group input {
            padding: 10px 12px;
            font-size: 14px;
            border-radius: 10px;
          }
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #4EADEE;
          box-shadow: 0 0 10px rgba(78, 173, 238, 0.3);
          background-color: #fff;
        }
        
        .form-group label {
          position: absolute;
          top: -10px;
          left: 15px;
          background-color: white;
          padding: 0 5px;
          font-size: 14px;
          color: #888;
          transition: all 0.3s;
        }
        
        @media (max-width: 480px) {
          .form-group label {
            font-size: 12px;
            top: -8px;
          }
        }
        
        .form-group input:focus + label {
          color: #3F87E5;
        }
        
        .form-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #CCC;
        }
        
        @media (max-width: 480px) {
          .form-icon {
            right: 12px;
          }
        }
        
        button {
          background: linear-gradient(90deg, #3F87E5, #65D6E4);
          color: white;
          border: none;
          padding: 15px;
          height: auto;
          width: 100%;
          border-radius: 12px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 15px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(63, 135, 229, 0.4);
        }
        
        @media (max-width: 768px) {
          button {
            padding: 12px;
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          button {
            padding: 10px;
            font-size: 15px;
            border-radius: 10px;
            margin-top: 10px;
          }
        }
        
        button:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 3s infinite;
        }
        
        button:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(63, 135, 229, 0.6);
        }
        
        .button-text {
          position: relative;
          z-index: 1;
        }
        
        .options {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          font-size: 15px;
          color: #888;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        @media (max-width: 768px) {
          .options {
            margin-top: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .options {
            font-size: 14px;
            margin-top: 15px;
          }
        }
        
        .options a {
          color: #3F87E5;
          text-decoration: none;
          transition: all 0.3s;
          position: relative;
          margin: 5px 0;
        }
        
        .options a:hover {
          color: #65D6E4;
        }
        
        .options a:after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -2px;
          left: 0;
          background-color: #65D6E4;
          transition: all 0.3s;
        }
        
        .options a:hover:after {
          width: 100%;
        }
        
        .social-login {
          margin-top: 40px;
          text-align: center;
        }
        
        @media (max-width: 768px) {
          .social-login {
            margin-top: 30px;
          }
        }
        
        @media (max-width: 480px) {
          .social-login {
            margin-top: 25px;
          }
        }
        
        .social-login p {
          color: #888;
          margin-bottom: 20px;
          position: relative;
          font-size: 15px;
        }
        
        @media (max-width: 768px) {
          .social-login p {
            margin-bottom: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .social-login p {
            font-size: 14px;
            margin-bottom: 12px;
          }
        }
        
        .social-login p::before,
        .social-login p::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 25%;
          height: 1px;
          background: linear-gradient(90deg, #FFF, #DDD);
        }
        
        .social-login p::after {
          right: 0;
          background: linear-gradient(90deg, #DDD, #FFF);
        }
        
        .social-icons {
          display: flex;
          justify-content: center;
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .social-icons {
            gap: 15px;
          }
        }
        
        @media (max-width: 480px) {
          .social-icons {
            gap: 12px;
          }
        }
        
        .social-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 20px;
          font-weight: bold;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
          .social-icon {
            width: 45px;
            height: 45px;
            font-size: 18px;
          }
        }
        
        @media (max-width: 480px) {
          .social-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
        }
        
        .social-icon-g {
          background: linear-gradient(135deg, #DB4437, #F4B400);
          color: white;
        }
        
        .social-icon-f {
          background: linear-gradient(135deg, #3b5998, #8b9dc3);
          color: white;
        }
        
        .social-icon-a {
          background: linear-gradient(135deg, #0077B5, #00a0dc);
          color: white;
        }
        
        .social-icon:hover {
          transform: translateY(-5px);
        }
        
        .carrot {
          position: absolute;
          width: 30px;
          height: 80px;
          background-color: #FF9800;
          border-radius: 50px;
          bottom: -20px;
          right: 50px;
          transform: rotate(-30deg);
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .carrot {
            width: 25px;
            height: 70px;
            right: 40px;
            bottom: -15px;
          }
        }
        
        @media (max-width: 480px) {
          .carrot {
            width: 20px;
            height: 60px;
            right: 30px;
            bottom: -10px;
          }
        }
        
        .carrot:before {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: #4CAF50;
          border-radius: 50% 50% 0 50%;
          top: -15px;
          left: -5px;
          transform: rotate(30deg);
        }
        
        .carrot:after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          background-color: #4CAF50;
          border-radius: 50% 0 50% 50%;
          top: -15px;
          right: -5px;
          transform: rotate(-30deg);
        }
        
        @media (max-width: 768px) {
          .carrot:before, .carrot:after {
            width: 18px;
            height: 18px;
            top: -12px;
          }
        }
        
        @media (max-width: 480px) {
          .carrot:before, .carrot:after {
            width: 15px;
            height: 15px;
            top: -10px;
          }
        }
        
        .error-message {
          color: #e74c3c;
          text-align: center;
          margin-bottom: 15px;
          font-size: 14px;
          padding: 5px;
          border-radius: 5px;
          background-color: rgba(231, 76, 60, 0.1);
        }
        
        @media (max-width: 480px) {
          .error-message {
            font-size: 13px;
            margin-bottom: 12px;
            padding: 4px;
          }
        }
      `}</style>
      
      <div className="stars"></div>
      
      {isLoggedIn ? (
        <div className="container">
          <div className="left-panel">
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            
            <div className="platform platform-1"></div>
            <div className="platform platform-2"></div>
            <div className="platform platform-3"></div>
            
            <div className="bunny-container" onMouseOver={handleBunnyHover}>
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
            <h2>You're Logged In!</h2>
            <p className="welcome-text">Ready to continue your habit journey?</p>
            
            <button onClick={handleLogout}>
              <span className="button-text">Logout</span>
            </button>
            
            <div className="options">
              <Link to="/dashboard">Go to Dashboard</Link>
              <Link to="/profile">View Profile</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container">
          <div className="left-panel">
            <div className="cloud cloud-1"></div>
            <div className="cloud cloud-2"></div>
            <div className="cloud cloud-3"></div>
            
            <div className="platform platform-1"></div>
            <div className="platform platform-2"></div>
            <div className="platform platform-3"></div>
            
            <div className="bunny-container" onMouseOver={handleBunnyHover}>
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
            <h2>Welcome Back</h2>
            <p className="welcome-text">Ready to continue your amazing habit journey? Let's hop right in!</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
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
                <span className="button-text">Hop In 🐰</span>
              </button>
            </form>
            
            <div className="options">
              <Link to="/forgot-password">Forgot password?</Link>
              <Link to="/register">Create account</Link>
            </div>
            
            <div className="social-login">
              <p>Or continue with</p>
              <div className="social-icons">
                <div className="social-icon social-icon-g">G</div>
                <div className="social-icon social-icon-f">f</div>
                <div className="social-icon social-icon-a">in</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
