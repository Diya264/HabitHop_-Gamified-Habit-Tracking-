import React, { useState, useEffect } from 'react';
import './FortuneCookie.css';
import 'styled-jsx/style';

export default function FortuneCookie() {
  const [fortune, setFortune] = useState('');
  const [previousFortunes, setPreviousFortunes] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [showFortune, setShowFortune] = useState(false);
  const [showCrack, setShowCrack] = useState(false);
  
  const fortunes = [
    "A journey of a thousand miles begins with a single step.",
    "Your habits today determine your future tomorrow.",
    "The universe rewards consistency and patience.",
    "Stars can't shine without darkness in your journey.",
    "Small steps every day lead to cosmic achievements.",
    "Your dedication will align the stars in your favor.",
    "The galaxy of success orbits around your daily habits.",
    "Persistence is the cosmic force that shapes destinies.",
    "Today's habits are tomorrow's destiny written in the stars.",
    "Your potential is infinite, like the expanding universe.",
    "The rhythm of consistency creates the melody of achievement.",
    "Let your habits be the constellations guiding your path.",
    "Every small habit is a star in your constellation of success.",
    "Don’t hold onto things that require a tight grip.",
    "I didn’t come this far to only come this far.",
    "Look how far you've come.",
    "Each time you break your own boundaries to ensure that someone else likes you, you like yourself a little less.",
    "Joy is what happens to us when we allow ourselves to recognize how good things really are.",
    "Joy is what happens to us when we allow ourselves to recognize how good things really are.",
    "What good are wings, without the courage to fly.",
    "Don't let yesterday take up too much of today.",
    "If you want the rainbow, you gotta put up with the rain!",
    "The most effective way to do it, is to do it.",
    "Breathe, Darling, this is just a chapter, not your whole story.",
    "No one is you and that is your superpower.",
    "Help! I'm being held prisoner in a fortune cookie factory.",
    "It always seems impossible until it is done.",
    "A problem will not be as bad as it seems",
    "A smile can bring a change is destiny today",
    "One click. One habit. One happy pet.",
    "Your pet says: ‘You did your best. And that’s better than perfect.’",
    "Missing one day won’t break the chain—but it might make your pet teary-eyed.",
    "Feed your pet with progress. They’re hungry for success!",
    "Big goals are just tiny habits in disguise.",
    "Consistency is your pet’s favorite treat.",
    "A new streak is born today. Feed it well. Let it grow.",
    "Your pet believes in you. Don't let the little guy down!",
    "You will soon discover that ‘done’ is better than ‘perfect’.",
    "Success is near. It’s just hiding behind your unopened notifications.",
    "The path to greatness starts with finishing one thing. Just one.",
    "Your future self says thanks for doing the hard thing today.",
    "Procrastination will try to seduce you. Say 'Not today, Satan!'",
    "You will conquer your to-do list… right after one more coffee.",
    "Tiny steps today lead to big wins tomorrow. Or at least fewer emails.",
    "You will soon eat something delicious… and it’s not this cookie.",
    "Don't worry—no one else knows what they’re doing either.",
    "You are destined to nap very soon. Resistance is futile.",
    "Good fortune is headed your way. It’s just stuck in traffic.",
    "You will soon receive a compliment. It might be from yourself. Still counts.",
    "You will soon find out that you don’t need anyone’s permission to succeed.",
    "You have the power to create your own luck. Today is the day!",
    "The future is shaped by what you do right after this cookie.",
    "Every habit you complete is a high-five to your future self.",
    "You're one tiny win away from a very big glow-up.",
    "That task you’re avoiding? Your courage is about to sneak attack it.",
    "You’ve got this. And if not, your pet’s got you.",
    "Start messy. Keep going. Finish proud.",
    "Forget perfect. Be persistent. Your streak will thank you.",
    "You’re closer than you think. Like... one-task-away close.",
    "You’re not stuck—you’re recalculating your awesome route.",
    "Your pet thinks you’re doing amazing. And pets never lie.",
    "You’re on a roll. Keep going!",
    "You’re almost there. Just one more step.",
    "You’re planting seeds. Don’t dig them up to check—just water and wait.",
    "Be proud of every checkmark. You earned it.",
    "Even on slow days, showing up is a power move."
  ];

  useEffect(() => {
    // Load previous fortunes from localStorage
    const savedFortunes = localStorage.getItem('previousFortunes');
    if (savedFortunes) {
      setPreviousFortunes(JSON.parse(savedFortunes));
    }
  }, []);

  const crackCookie = () => {
    // Get random fortune
    const newFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
    
    // Animate
    setIsShaking(true);
    setShowCrack(true);
    
    setTimeout(() => {
      setIsShaking(false);
      setFortune(newFortune);
      setShowFortune(true);
      
      // Update previous fortunes (avoiding duplicates)
      const updatedFortunes = [newFortune, ...previousFortunes.filter(f => f !== newFortune)].slice(0, 3);
      setPreviousFortunes(updatedFortunes);
      
      // Save to localStorage
      localStorage.setItem('previousFortunes', JSON.stringify(updatedFortunes));
      
      setTimeout(() => {
        setShowCrack(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="fortune-cookie-container" style={{height: "100%", overflowY: "auto"}}>
      {/* Cosmic background with animated elements */}
      <div className="cosmic-bg">
        {/* Nebula clouds */}
        <div className="nebula-1"></div>
        <div className="nebula-2"></div>
        <div className="nebula-3"></div>
        <div className="nebula-1" style={{top: "70%", left: "25%"}}></div>
        <div className="nebula-2" style={{top: "90%", right: "15%"}}></div>
        
        {/* Animated stars */}
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
        
        {/* Shooting stars */}
        <div className="shooting-star shooting-star-1"></div>
        <div className="shooting-star shooting-star-2"></div>
        <div className="shooting-star shooting-star-3"></div>
        <div className="shooting-star shooting-star-1" style={{top: "80%"}}></div>
      </div>
      
      {/* Content */}
      <div style={{maxWidth: "32rem", margin: "0 auto", textAlign: "center", position: "relative", zIndex: "10", paddingBottom: "4rem", paddingTop: "1rem"}}>
        {/* Fortune Cookie */}
        <div style={{marginBottom: "2rem", position: "relative"}}>
          <div className={`${isShaking ? 'animate-cookie-shake' : ''}`} 
               style={{fontSize: "6rem", marginBottom: "0.5rem", display: "inline-block", transition: "all 0.3s"}}>
            🥠
          </div>
          {showCrack && (
            <div style={{position: "absolute", top: "1.5rem", right: "50%", transform: "translateX(1rem)"}}>
              <div className="animate-sparkle" style={{color: "#fde047", fontSize: "1.875rem"}}>✨</div>
            </div>
          )}
        </div>
        
        {/* Main Title */}
        <h1 className="glow-text" 
            style={{fontSize: "1.875rem", fontWeight: "bold", marginBottom: "2rem", 
                   background: "linear-gradient(to right, #fde68a, #fef3c7, #fde68a)", 
                   WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"}}>
          Fortune Oracle
        </h1>
        
        {/* Button */}
        <button 
          onClick={crackCookie}
          style={{padding: "1rem 2rem", background: "linear-gradient(to right, #FEBE10, #FFD700, #FFFF00)", 
                 borderRadius: "0.5rem", fontSize: "1.25rem", fontWeight: "bold", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", 
                 transition: "all 0.3s", marginBottom: "2.5rem", transform: "translateY(0)", 
                 cursor: "pointer", color: "white"}}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-0.25rem)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          Crack the Cookie
        </button>
        
        {/* Current Fortune */}
        {showFortune && (
          <div className="fortune-card" style={{marginBottom: "3rem"}}>
            <p style={{fontSize: "1.25rem", fontStyle: "italic", fontWeight: "500", color: "white"}}>{fortune}</p>
          </div>
        )}
        
        {/* Previous Fortunes */}
        {previousFortunes.length > 0 && (
          <div style={{marginTop: "2rem"}}>
            <h2 style={{fontSize: "1.5rem", fontWeight: "600", marginBottom: "1.5rem", 
                       background: "linear-gradient(to right, #d8b4fe, #e9d5ff, #d8b4fe)", 
                       WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", 
                       display: "flex", alignItems: "center", justifyContent: "center"}}>
              <span className="animate-pulse" style={{color: "#fde047", marginRight: "0.5rem"}}>★</span>
              Your Previous Fortunes
              <span className="animate-pulse" style={{color: "#fde047", marginLeft: "0.5rem"}}>★</span>
            </h2>
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
              {previousFortunes.map((prevFortune, index) => (
                <div key={index} className="prev-fortune-card">
                  <p style={{color: "#bfdbfe", fontSize: "1.125rem"}}>{prevFortune}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}