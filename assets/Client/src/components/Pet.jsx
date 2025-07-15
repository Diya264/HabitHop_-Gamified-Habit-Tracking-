import React, { useState, useEffect, useRef } from 'react';
import './Pet.css';
import { fetchUserMood, mapServerMoodToPetMood, getMoodStatusText } from '../services/moodService';

const Pet = () => {
  const [mood, setMood] = useState('sad');
  const [originalMood, setOriginalMood] = useState('sad');
  const [statusText, setStatusText] = useState("Sad: Your pet is feeling blue... Give it some love!");
  const [animation, setAnimation] = useState(null);
  const [habitBasedMood, setHabitBasedMood] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [petName, setPetName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [accountAge, setAccountAge] = useState(0);
  
  const petRef = useRef(null);
  const nameInputRef = useRef(null);
  const temporaryMoodTimeoutRef = useRef(null);
  const idleTimerRef = useRef(null);
  const sleepIdleTimerRef = useRef(null);
  const randomMoodTimerRef = useRef(null);
  const headMovementIntervalRef = useRef(null);
  const moodFetchIntervalRef = useRef(null);


  // Array of available moods to cycle through when clicking
  const moods = [
    { name: 'sad', text: "Sad: Your pet is feeling blue because some habits were missed yesterday..." },
    { name: 'happy', text: "Happy: Your pet is thrilled with your habit progress! (2+ habits completed today or 3+ day streak)" },
    { name: 'angry', text: "Angry: Your pet is upset! (No habits completed today or from interactions)" },
    { name: 'excited', text: "Excited: Your pet can't contain its joy! (6+ habits completed today or from interactions)" },
    { name: 'sleeping', text: "Sleeping: Shh... Your pet is taking a nap. (From long inactivity or interactions)" },
    { name: 'curious', text: "Curious: Your pet is interested in your habit progress! (1 habit completed today or 1-2 day streak)" },
    { name: 'idle', text: "Idle: Your pet is waiting for you to complete more habits!" }
  ];

  // Helper function to reset mood
  const resetMood = () => {
    if (temporaryMoodTimeoutRef.current) clearTimeout(temporaryMoodTimeoutRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (sleepIdleTimerRef.current) clearTimeout(sleepIdleTimerRef.current);
    stopRandomHeadMovement();
    setMood('');
  };

  // Function to get the current mood classes for conditional rendering
  const getMoodClass = () => {
    let classes = 'pet idle-animation';
    if (mood) classes += ` ${mood}`;
    if (animation) classes += ` ${animation}`;
    return classes;
  };

  // Play animation
  const playAnimation = (animationType) => {
    setAnimation(animationType);
    setTimeout(() => {
      setAnimation(null);
    }, animationType === 'bounce' ? 500 : 700);
  };

  // Start random head movements
  const startRandomHeadMovement = () => {
    // Clear existing interval if any
    stopRandomHeadMovement();
    
    // Set new interval
    headMovementIntervalRef.current = setInterval(() => {
      const rand = Math.random();
      
      // Don't move head if sleeping or during certain animations
      if (mood === 'sleeping' || 
          animation === 'bounce' || 
          animation === 'spin' || 
          mood === 'curious-head-movement') {
        return;
      }
      
      if (rand < 0.3) {
        setMood(prevMood => {
          // Remove look directions and add look-left
          const baseMood = prevMood.replace(' look-left', '').replace(' look-right', '');
          return `${baseMood} look-left`;
        });
      } else if (rand < 0.6) {
        setMood(prevMood => {
          // Remove look directions and add look-right
          const baseMood = prevMood.replace(' look-left', '').replace(' look-right', '');
          return `${baseMood} look-right`;
        });
      } else {
        // Remove look directions to look straight
        setMood(prevMood => prevMood.replace(' look-left', '').replace(' look-right', ''));
      }
    }, 3000);
    
    // Reset the idle timer when there's movement
    resetIdleTimer();
  };

  // Stop random head movements
  const stopRandomHeadMovement = () => {
    if (headMovementIntervalRef.current) {
      clearInterval(headMovementIntervalRef.current);
      headMovementIntervalRef.current = null;
    }
  };

  // Reset idle timer
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (sleepIdleTimerRef.current) clearTimeout(sleepIdleTimerRef.current);
    
    // If no interaction for 30 seconds, switch to idle mode or habit-based mood
    idleTimerRef.current = setTimeout(() => {
      // Only change mood if not in one of these specific moods and not interacting
      if (!['sad', 'angry', 'sleeping', 'curious'].includes(mood) && !isInteracting) {
        resetMood();
        
        // If we have a habit-based mood, use that instead of idle
        if (habitBasedMood) {
          setOriginalMood(habitBasedMood);
          setMood(habitBasedMood);
          setStatusText(getMoodStatusText(habitBasedMood));
        } else {
          setOriginalMood('idle');
          setMood('idle');
          setStatusText("Your pet is getting bored...");
        }
      }
    }, 30000);

    // If no interaction for 4 minutes, go to sleep (unless there's a habit-based mood)
    sleepIdleTimerRef.current = setTimeout(() => {
      // Only go to sleep if not interacting and no habit-based mood
      if (!isInteracting && !habitBasedMood) {
        resetMood();
        setOriginalMood('sleeping');
        setMood('sleeping');
        setStatusText("Your pet got sleepy and fell asleep...");
      } 
      // If there's a habit-based mood and not interacting, revert to it
      else if (!isInteracting && habitBasedMood) {
        resetMood();
        setOriginalMood(habitBasedMood);
        setMood(habitBasedMood);
        setStatusText(getMoodStatusText(habitBasedMood));
        
        if (habitBasedMood !== 'sleeping') {
          startRandomHeadMovement();
        }
      }
    }, 240000);
  };

  // Start random mood changes
  const startRandomMoodChanges = () => {
    // Clear existing timer if any
    if (randomMoodTimerRef.current) {
      clearTimeout(randomMoodTimerRef.current);
    }
    
    // Set random timer between 25-45 seconds
    const randomTime = 25000 + Math.floor(Math.random() * 20000);
    
    randomMoodTimerRef.current = setTimeout(() => {
      // Only change mood if pet is in idle or happy state AND not currently interacting
      // AND there's no habit-based mood override
      if ((mood === 'idle' || mood === 'happy') && !isInteracting && !habitBasedMood) {
        const randMood = Math.random();
        
        if (randMood < 0.15) {
          // 15% chance to become curious
          resetMood();
          setOriginalMood('curious');
          setMood('curious curious-head-movement');
          setStatusText("Your pet noticed something interesting!");
          
          setTimeout(() => {
            setMood('curious');
            startRandomHeadMovement();
          }, 2000);
        } else if (randMood < 0.25) {
          // 10% chance to become sleepy
          resetMood();
          setOriginalMood('sleeping');
          setMood('sleeping');
          setStatusText("Your pet got sleepy and is taking a nap.");
        } else if (randMood < 0.30) {
          // 5% chance to become idle
          resetMood();
          setOriginalMood('idle');
          setMood('idle');
          setStatusText("Your pet is just chilling...");
          startRandomHeadMovement();
        }
      } else if (!isInteracting && habitBasedMood && mood !== habitBasedMood) {
        // If we're not interacting and there's a habit-based mood that's different from current mood,
        // revert to the habit-based mood
        resetMood();
        setOriginalMood(habitBasedMood);
        setMood(habitBasedMood);
        setStatusText(getMoodStatusText(habitBasedMood));
        
        if (habitBasedMood !== 'sleeping') {
          startRandomHeadMovement();
        }
      }
      
      // Restart the random mood timer
      startRandomMoodChanges();
    }, randomTime);
  };

  // Set mood handler function
  const handleSetMood = (newMood, text) => {
    console.log(`🐱 Setting mood to: ${newMood} with text: ${text}`);
    
    resetMood();
    setOriginalMood(newMood);
    setMood(newMood);
    setStatusText(text);
    
    // Mark that user is interacting with the pet
    setIsInteracting(true);
    
    if (newMood !== 'sleeping') {
      startRandomHeadMovement();
    }
    
    if (newMood === 'curious') {
      setMood('curious curious-head-movement');
      
      setTimeout(() => {
        setMood('curious');
        startRandomHeadMovement();
      }, 2000);
    }
    
    if (newMood === 'excited') {
      console.log("🐱 Playing bounce animation for excited mood");
      playAnimation('bounce');
      
      // Add a second bounce after a short delay for extra excitement
      setTimeout(() => {
        playAnimation('bounce');
      }, 1000);
    }
    
    // Set a timeout to allow habit-based mood to take over again after interaction
    setTimeout(() => {
      console.log(`🐱 Interaction timeout ended for mood: ${newMood}`);
      setIsInteracting(false);
      
      // After the interaction period, if we have a habit-based mood, revert to it
      if (habitBasedMood) {
        console.log(`🐱 Reverting to habit-based mood: ${habitBasedMood} after interaction timeout`);
        fetchMoodFromServer(); // This will update the mood if not interacting
      }
    }, 30000); // 30 seconds after interaction
  };

  // Cycle to the next mood when pet is clicked
  const cycleMood = () => {
    console.log("🐱 Cycling mood from:", originalMood);
    
    // Clean up the original mood (remove any look-left/look-right classes)
    const cleanMood = originalMood.replace(' look-left', '').replace(' look-right', '');
    console.log("🐱 Cleaned mood:", cleanMood);
    
    // Find current mood index
    let currentMoodIndex = moods.findIndex(m => m.name === cleanMood);
    
    // If current mood not found in the array, default to first mood
    if (currentMoodIndex === -1) {
      currentMoodIndex = 0;
      console.log("🐱 Current mood not found in moods array, defaulting to first mood");
    }
    
    // Get next mood (or go back to first mood if at end)
    const nextMoodIndex = (currentMoodIndex + 1) % moods.length;
    const nextMood = moods[nextMoodIndex];
    
    console.log(`🐱 Cycling from mood ${currentMoodIndex} (${cleanMood}) to mood ${nextMoodIndex} (${nextMood.name})`);
    
    // Force reset any ongoing animations or timers
    resetMood();
    
    // Set the new mood with a slight delay to ensure animations work
    setTimeout(() => {
      // Set the new mood
      handleSetMood(nextMood.name, nextMood.text);
      
      // Add appropriate animation
      if (nextMood.name === 'excited' || nextMood.name === 'happy') {
        playAnimation('bounce');
      }
    }, 50);
  };

  // Handle pet clicks
  const handlePetClick = () => {
    console.log("🐱 Pet clicked! Current mood:", mood, "Animation:", animation);
    
    if (animation !== 'bounce' && animation !== 'spin') {
      // Mark that user is interacting with the pet
      setIsInteracting(true);
      
      // Double-clicking (second click within 300ms) will cycle to next mood
      if (petRef.current) {
        const now = new Date().getTime();
        
        if (petRef.current.lastClickTime && (now - petRef.current.lastClickTime < 300)) {
          // Double click detected - this takes priority over single click behaviors
          console.log("🐱 Double-click detected! Time between clicks:", now - petRef.current.lastClickTime, "ms");
          petRef.current.lastClickTime = null;
          
          // Cycle to the next mood
          cycleMood();
          return; // Exit early to prevent single-click behavior
        } else {
          // First click, record time
          console.log("🐱 First click detected, waiting for possible second click");
          petRef.current.lastClickTime = now;
        }
      }
      
      // Single click behaviors
      // If pet is in one of these states, handle special interactions
      if (mood === 'sad' || mood === 'angry') {
        // Store the original mood
        const moodToRestore = mood;
        
        // Change to happy temporarily
        resetMood();
        setMood('happy-clicked');
        playAnimation('bounce');
        setStatusText(moodToRestore === 'sad' ? 
          "You cheered up your pet for a moment!" : 
          "Your pet calmed down temporarily!");
        
        // Set a timeout to revert back to original mood after 5 seconds
        temporaryMoodTimeoutRef.current = setTimeout(() => {
          resetMood();
          
          // Fetch the latest mood from the server
          fetchMoodFromServer();
          
          startRandomHeadMovement();
          setIsInteracting(false);
        }, 5000);
        
      } else if (mood === 'sleeping') {
        resetMood();
        // Changed from angry to curious when waking up
        setOriginalMood('curious');
        setMood('curious curious-head-movement');
        setStatusText("You woke your pet up! It's curious about what's happening!");
        
        // Remove the curious head movement after animation completes
        setTimeout(() => {
          setMood('curious');
          startRandomHeadMovement();
          
          // After being curious for a while, return to habit-based mood or default
          setTimeout(() => {
            resetMood();
            
            // If we have a habit-based mood, use that
            if (habitBasedMood && !isInteracting) {
              setOriginalMood(habitBasedMood);
              setMood(habitBasedMood);
              setStatusText(getMoodStatusText(habitBasedMood));
            } else {
              setOriginalMood('sad');
              setMood('sad');
              setStatusText("Your pet is feeling blue again.");
            }
            
            startRandomHeadMovement();
            setIsInteracting(false);
          }, 10000); // Stay curious for 10 seconds before changing
        }, 2000);
      }
        
      else if (mood === 'happy') {
        playAnimation('bounce');
        setMood('happy-clicked');
        setStatusText("Your pet loves the attention!");
        
        // Remove happy-clicked class after animation
        setTimeout(() => {
          fetchMoodFromServer();
          setIsInteracting(false);
        }, 700);
        
      } else if (mood === 'excited' || mood === 'happy-clicked') {
        playAnimation('spin');
        setStatusText("Your pet is super excited!");
        setTimeout(() => {
          fetchMoodFromServer();
          setIsInteracting(false);
        }, 1000);
        
      } else if (mood.includes('curious')) {
        // If already curious, make it do the curious head movement again
        setMood('curious');
        setTimeout(() => {
          setMood('curious curious-head-movement');
          setStatusText("Your pet is even more curious now!");
          setTimeout(() => {
            setMood('curious');
            setIsInteracting(false);
          }, 2000);
        }, 10);
        
      } else if (mood === 'idle') {
        // Change from idle to curious when clicked
        resetMood();
        setOriginalMood('angry');
        setMood('angry');
        setStatusText("Your pet is very upset!");
        
        setTimeout(() => {
          setMood('upset');
          startRandomHeadMovement();
          setTimeout(() => {
            setIsInteracting(false);
          }, 5000);
        }, 2000);
      }
    }
  };

  // Function to fetch mood from server
  const fetchMoodFromServer = async () => {
    try {
      console.log('🐱 Fetching mood from server...');
      
      // Clear any cached data to ensure we get fresh data
      const timestamp = new Date().getTime();
      const serverMood = await fetchUserMood(`?t=${timestamp}`);
      console.log(`🐱 Server returned mood: ${serverMood}`);
      
      if (serverMood) {
        const petMood = mapServerMoodToPetMood(serverMood);
        console.log(`🐱 Mapped to pet mood: ${petMood}`);
        
        // Store the habit-based mood
        setHabitBasedMood(petMood);
        
        // Only update if not currently in an interaction
        if (!isInteracting) {
          console.log(`🐱 Updating pet mood to: ${petMood}`);
          setOriginalMood(petMood);
          setMood(petMood);
          
          // Update the status text to match the mood
          const newStatusText = getMoodStatusText(petMood);
          console.log(`🐱 Setting status text: "${newStatusText}"`);
          setStatusText(newStatusText);
          
          // Add bounce animation for excited mood
          if (petMood === 'excited') {
            playAnimation('bounce');
          }
          
          // Start head movement for the new mood if appropriate
          if (petMood !== 'sleeping') {
            startRandomHeadMovement();
          }
        } else {
          console.log(`🐱 Not updating pet mood (user is interacting), but stored habit-based mood: ${petMood}`);
        }
      } else {
        console.log(`🐱 No mood returned from server, keeping current mood`);
      }
    } catch (error) {
      console.error('Error updating pet mood from habits:', error);
      
      // Only set a default mood if not currently interacting
      if (!isInteracting) {
        setMood('idle');
        setStatusText("Your pet is waiting for habit data...");
      }
    }
  };

   // Pet name handling
   const handleNameChange = (e) => {
    setPetName(e.target.value);
  };

  const handleNameSave = () => {
    if (petName.trim()) {
      localStorage.setItem('petName', petName);
    }
    setIsEditingName(false);
  };

  const handleEditClick = () => {
    setIsEditingName(true);
    // Focus the input after rendering
    setTimeout(() => {
      if (nameInputRef && nameInputRef.current) {
        nameInputRef.current.focus();
      } else {
        console.warn('nameInputRef is not available');
      }
    }, 10); // Slightly longer timeout to ensure the input is rendered
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setPetName(localStorage.getItem('petName') || '');
    }
  };

  // Calculate pet age in days, months, or years using a natural format
  const calculateAge = (creationDate) => {
    const now = new Date();
    let created;
    
    // Parse the creation date
    try {
      if (typeof creationDate === 'string') {
        // Handle MySQL timestamp format (YYYY-MM-DD HH:MM:SS)
        if (creationDate.includes('-') && !creationDate.includes('T')) {
          // Replace space with T to make it ISO format
          created = new Date(creationDate.replace(' ', 'T'));
        } else {
          created = new Date(creationDate);
        }
      } else if (creationDate instanceof Date) {
        created = creationDate;
      } else {
        console.error('Invalid date format:', creationDate);
        return "1 day old";
      }
      
      // Check if date is valid
      if (isNaN(created.getTime())) {
        console.error('Invalid date:', creationDate);
        return "1 day old";
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return "1 day old";
    }
    
    // Calculate difference in milliseconds
    const diffMs = Math.abs(now - created);
    
    // Convert to days (milliseconds / (1000 * 60 * 60 * 24))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // If account was created today, show 1 day
    if (now.toDateString() === created.toDateString() || diffDays === 0) {
      return "1 day old";
    }
    
    // Calculate months and years
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    // For accounts less than a month old, show days
    if (diffDays < 31) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`;
    }
    
    // For accounts less than a year old, show months and days
    if (diffYears < 1) {
      const remainingDays = diffDays % 30;
      
      // If it's exactly X months (no remaining days)
      if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} old`;
      }
      
      // If it's X months and Y days
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''} old`;
    }
    
    // For accounts more than a year old, show years and months
    const remainingMonths = diffMonths % 12;
    
    // If it's exactly X years (no remaining months)
    if (remainingMonths === 0) {
      return `${diffYears} year${diffYears !== 1 ? 's' : ''} old`;
    }
    
    // If it's X years and Y months
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''} old`;
  };

  // Initialize on mount
  useEffect(() => {
    // Load pet name from local storage
    const savedName = localStorage.getItem('petName');
    if (savedName) {
      setPetName(savedName);
    }

    // Get the token for API requests
    const token = localStorage.getItem('token');
    
    // Function to fetch user data from the server
    const fetchUserData = async () => {
      if (!token) return null;
      
      try {
        console.log('Fetching user data from server for pet age calculation');
        const response = await fetch('http://localhost:5000/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);
        
        // Store the user data in localStorage for future use
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return userData;
      } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
      }
    };
    
    // Function to get the account creation date
    const getAccountCreationDate = async () => {
      console.log('Getting account creation date for current user');
      
      // Get the current user ID from token
      const token = localStorage.getItem('token');
      let userId = null;
      
      if (token) {
        try {
          // Decode the JWT token to get the user ID
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const payload = JSON.parse(jsonPayload);
          userId = payload.id;
          console.log('Current user ID from token:', userId);
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
      
      // Use user-specific key for storing creation date
      const userSpecificKey = userId ? `accountCreationDate_${userId}` : 'accountCreationDate';
      console.log('Using storage key:', userSpecificKey);
      
      // First try to get from localStorage with user-specific key
      let accountCreationDate = localStorage.getItem(userSpecificKey);
      let userCreatedAt = null;
      
      // Always fetch fresh data from server for the current user
      if (token) {
        console.log('Fetching fresh user data from server');
        const serverUserData = await fetchUserData();
        
        if (serverUserData) {
          console.log('Server returned user data:', serverUserData);
          
          if (serverUserData.created_at) {
            userCreatedAt = serverUserData.created_at;
            console.log('Found created_at in server userData:', userCreatedAt);
          } else if (serverUserData.createdAt) {
            userCreatedAt = serverUserData.createdAt;
            console.log('Found createdAt in server userData:', userCreatedAt);
          }
          
          // Store the user data with user-specific key
          if (userId) {
            localStorage.setItem(`userData_${userId}`, JSON.stringify(serverUserData));
          }
        }
      }
      
      // If we got a creation date from the server, use it
      if (userCreatedAt) {
        accountCreationDate = userCreatedAt;
        localStorage.setItem(userSpecificKey, accountCreationDate);
        console.log('Using server-provided creation date:', accountCreationDate);
      } else if (!accountCreationDate) {
        // If we don't have a creation date, set it to the current date
        accountCreationDate = new Date().toISOString();
        localStorage.setItem(userSpecificKey, accountCreationDate);
        console.log('No creation date found, using current date:', accountCreationDate);
      } else {
        console.log('Using existing account creation date from localStorage:', accountCreationDate);
      }
      
      return accountCreationDate;
    };
    
    // Initialize the pet age
    getAccountCreationDate().then(creationDate => {
      console.log('Using account creation date:', creationDate);
      
      // Set the age based on the actual creation date
      setAccountAge(calculateAge(creationDate));
      
      // Update the age calculation periodically (every hour for more responsive updates)
      const ageUpdateInterval = setInterval(() => {
        // Get the current user ID from token
        const token = localStorage.getItem('token');
        let userId = null;
        
        if (token) {
          try {
            // Decode the JWT token to get the user ID
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const payload = JSON.parse(jsonPayload);
            userId = payload.id;
          } catch (error) {
            console.error('Error decoding token for age update:', error);
          }
        }
        
        // Use user-specific key for getting creation date
        const userSpecificKey = userId ? `accountCreationDate_${userId}` : 'accountCreationDate';
        const currentCreationDate = localStorage.getItem(userSpecificKey);
        
        if (currentCreationDate) {
          setAccountAge(calculateAge(currentCreationDate));
        } else {
          // If no creation date found, fetch it again
          getAccountCreationDate().then(newCreationDate => {
            setAccountAge(calculateAge(newCreationDate));
          });
        }
      }, 60 * 60 * 1000); // Update once per hour
      
      // Clean up the interval when the component unmounts
      return () => clearInterval(ageUpdateInterval);
    });


    // Start with loading state
    setMood('idle');
    setStatusText("Loading your pet's mood based on your habits...");
    
    // Fetch initial mood from server immediately
    fetchMoodFromServer();
    
    // Set up interval to periodically fetch mood (every minute)
    moodFetchIntervalRef.current = setInterval(fetchMoodFromServer, 60 * 1000);
    
    // Listen for refresh events (for manual refresh)
    const handleRefreshEvent = (event) => {
      console.log('🔄 Received refresh-pet-mood event', event.detail || 'no details');
      
      // Reset interaction state to ensure mood updates
      setIsInteracting(false);
      
      // Check if the event includes a server-provided mood
      if (event.detail && event.detail.serverMood) {
        console.log(`🔄 Event includes server-provided mood: ${event.detail.serverMood}`);
        
        // Map the server mood to pet mood
        const petMood = mapServerMoodToPetMood(event.detail.serverMood);
        console.log(`🐱 Mapped to pet mood: ${petMood}`);
        
        // Store the habit-based mood
        setHabitBasedMood(petMood);
        
        // Update the pet's mood immediately
        setOriginalMood(petMood);
        setMood(petMood);
        
        // Update the status text to match the mood
        const newStatusText = getMoodStatusText(petMood);
        console.log(`🐱 Setting status text: "${newStatusText}"`);
        setStatusText(newStatusText);
        
        // Add bounce animation for excited mood
        if (petMood === 'excited') {
          playAnimation('bounce');
        }
        
        // Start head movement for the new mood if appropriate
        if (petMood !== 'sleeping') {
          startRandomHeadMovement();
        }
      } else {
        // Force a refresh of the mood from the server
        console.log('🔄 Forcing mood refresh from server');
        
        // Add a small delay to ensure the server has updated its state
        setTimeout(() => {
          console.log('🔄 Fetching mood after delay');
          fetchMoodFromServer();
        }, 500);
      }
    };
    window.addEventListener('refresh-pet-mood', handleRefreshEvent);
    
    // Start random behaviors
    startRandomHeadMovement();
    startRandomMoodChanges();
    resetIdleTimer();
    
    // Cleanup on unmount
    return () => {
      if (temporaryMoodTimeoutRef.current) clearTimeout(temporaryMoodTimeoutRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (sleepIdleTimerRef.current) clearTimeout(sleepIdleTimerRef.current);
      if (randomMoodTimerRef.current) clearTimeout(randomMoodTimerRef.current);
      if (headMovementIntervalRef.current) clearInterval(headMovementIntervalRef.current);
      if (moodFetchIntervalRef.current) clearInterval(moodFetchIntervalRef.current);
      window.removeEventListener('refresh-pet-mood', handleRefreshEvent);
      // Note: The ageUpdateInterval is cleaned up in its own useEffect
    };
  }, []);

  return (
    <div className="pet-container">
       <div className="pet-info-card">
        <div className="pet-name-container">
          {isEditingName ? (
            <div className="edit-name-container">
              <input 
                ref={nameInputRef}
                type="text" 
                value={petName} 
                onChange={handleNameChange} 
                onBlur={handleNameSave}
                onKeyDown={handleKeyDown}
                className="pet-name-input"
                placeholder="Enter pet name"
                maxLength={20}
              />
              <button className="save-name-btn" onClick={handleNameSave}>Save</button>
            </div>
          ) : (
            <div className="display-name-container">
              <h3 className="pet-name">{petName || "Unnamed Pet"}</h3>
              <button className="edit-name-btn" onClick={handleEditClick}>
                ✏️
              </button>
            </div>
          )}
        </div>
        <div className="pet-age">{accountAge}</div>
      </div>
      <div className={getMoodClass()} onClick={handlePetClick} ref={petRef}>
        <div className="sparkles">
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
        <div className="body"></div>
        <div className="head"></div>
        <div className="ear-left"></div>
        <div className="ear-right"></div>
        <div className="inner-ear-left"></div>
        <div className="inner-ear-right"></div>
        <div className="eye-left">
          <div className="eye-shine-left"></div>
        </div>
        <div className="eye-right">
          <div className="eye-shine-right"></div>
        </div>
        <div className="tear-left"></div>
        <div className="tear-right"></div>
        <div className="blush-left"></div>
        <div className="blush-right"></div>
        <div className="pet-nose"></div>
        <div className="pet-mouth"></div>
        <div className="tail"></div>
        <div className="forelock"></div>
        <div className="paw-front-left"></div>
        <div className="paw-front-right"></div>
        <div className="zzz">Zzzz</div>
        <div className="question-mark">?</div>
      </div>
      
      <div className="status">
        {statusText}
      </div>
    </div>
  );
};

export default Pet;