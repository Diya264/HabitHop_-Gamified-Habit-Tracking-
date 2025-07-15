import React, { useState, useEffect } from 'react';
import '../styles/BadgeNotification.css';

const BadgeNotification = ({ badge, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [validBadge, setValidBadge] = useState(false);

  useEffect(() => {
    console.log('🏆 BadgeNotification received badge:', badge);
    
    // Validate the badge before showing
    if (!badge) {
      console.log('❌ No badge data provided, not showing notification');
      onClose();
      return;
    }
    
    // Additional validation to ensure we have at least an ID or name
    if (!badge.id && !badge.badge_name && !badge.name) {
      console.log('❌ Invalid badge data (missing ID and name), not showing notification');
      console.log('Badge data received:', badge);
      onClose();
      return;
    }
    
    // Get a unique identifier for this badge
    const badgeId = badge.id || 'unknown';
    const badgeName = badge.badge_name || badge.name || 'Unknown Badge';
    
    console.log(`✅ Valid badge data received: ID=${badgeId}, Name=${badgeName}`);
    
    // Mark this badge as valid
    console.log(`🎉 Showing notification for badge ${badgeId} (${badgeName})`);
    setValidBadge(true);
    
    // Animate in
    setTimeout(() => {
      console.log('🔄 Setting badge notification to visible');
      setVisible(true);
    }, 100);
    
    // Auto-close after 8 seconds
    const timer = setTimeout(() => {
      console.log('⏱️ Auto-closing badge notification after timeout');
      setVisible(false);
      setTimeout(onClose, 500); // Allow animation to complete before removing
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [badge, onClose]);

  const getIconPath = (filename) => {
    if (!filename) return null;
    return `/assets/badges/${filename}`;
  };

  // Don't render anything if the badge is invalid
  if (!validBadge) {
    return null;
  }

  return (
    <div className={`badge-notification ${visible ? 'visible' : ''}`}>
      <div className="badge-notification-content">
        <div className="badge-notification-header">
          <h3>🎉 New Badge Earned!</h3>
          <button className="close-button" onClick={() => {
            setVisible(false);
            setTimeout(onClose, 500);
          }}>×</button>
        </div>
        
        <div className="badge-notification-body">
          {badge && badge.icon ? (
            <img 
              src={getIconPath(badge.icon)} 
              alt={badge.badge_name || badge.name || "Badge"} 
              className="badge-notification-image" 
            />
          ) : (
            <div className="badge-notification-image badge-placeholder">
              🏆
            </div>
          )}
          <div className="badge-notification-text">
            <h4>{badge.badge_name || badge.name || "New Badge"}</h4>
            <p>{badge.badge_description || badge.description || "You've earned a new achievement!"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;