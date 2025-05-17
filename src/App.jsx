/** Playful Guess the Number Game - Responsive + Fun UI **/
import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [targetNumber] = useState(Math.floor(Math.random() * 1000) + 1);
  const [guess, setGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
    const [feedback, setFeedback] = useState('');
  const buttonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const [animateSegments, setAnimateSegments] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);
  const wakeLockRef = useRef(null);

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      console.log('Wake Lock enabled');
    }
  } catch (err) {
    console.error('Wake Lock failed:', err);
  }
};

const handlePlay = async () => {
  const elem = document.documentElement;

  try {
    if (elem.requestFullscreen) await elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();

    await requestWakeLock(); // Keep screen awake
    setShowIntro(false);
    setIsFullscreenEnabled(true);
  } catch (err) {
    console.error('Could not enter fullscreen or wake lock:', err);
  }
};

useEffect(() => {
  const reRequestWakeLock = async () => {
    if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.error('Wake Lock re-request failed:', err);
      }
    }
  };

  document.addEventListener('visibilitychange', reRequestWakeLock);
  return () => {
    document.removeEventListener('visibilitychange', reRequestWakeLock);
  };
}, []);


useEffect(() => {
  if (!isFullscreenEnabled) return;

  const reenterFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
    }
  };

  const handleKeyDown = (e) => {
    if (['Escape', 'F11'].includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
    if ((e.ctrlKey && (e.key === 'w' || e.key === 't')) || e.altKey) {
      e.preventDefault();
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      reenterFullscreen();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      reenterFullscreen();
    }
  };

  const preventContextMenu = (e) => e.preventDefault();

  window.addEventListener('keydown', handleKeyDown);
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('contextmenu', preventContextMenu);
  window.addEventListener('blur', reenterFullscreen);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('contextmenu', preventContextMenu);
    window.removeEventListener('blur', reenterFullscreen);
  };
}, [isFullscreenEnabled]);



  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 480);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (guess && inputRef.current) {
      inputRef.current.classList.add('slot-animate');
      const timeout = setTimeout(() => {
        inputRef.current.classList.remove('slot-animate');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [guess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const userGuess = parseInt(guess);
    setAnimateSegments(true);
    setFeedback('');

    // Create pattern animation before final check
    let bufferPatterns = [
      '●   ', ' ●  ', '  ● ', '   ●',
      '● ● ', ' ● ●', '● ● ', '●  ●',
      ' ●● ', '● ● ', ' ● ●', '● ● ',
      '8888', '----', '____'
    ];
    let i = 0;
    const patternInterval = setInterval(() => {
      setFeedback(bufferPatterns[i % bufferPatterns.length]);
      i++;
      if (i >= 75) { // ~15s if interval = 200ms
        clearInterval(patternInterval);

        // Final check after animation
        if (userGuess === targetNumber) {
        setFeedback('CRCT');
        setTimeout(() => {
          // Reset game state
          setGuess('');
          setGameOver(false);
          setFeedback('');
          setAnimateSegments(false);
        }, 1000);
        } else {
          setFeedback('WRNG');
          setTimeout(() => {
            window.location.href = 'https://example.com';
          }, 1000);
        }
      }
    }, 200);
  };

  
  const renderSegments = () => {
    const text = feedback ? feedback : String(guess).padStart(4, '-');
    return [...text].map((char, index) => (
      <div
        key={index}
        className={`segment-digit ${animateSegments ? 'flash' : ''} ${feedback === 'WRNG' ? 'wrong' : ''} ${feedback === 'CRCT' ? 'correct' : ''}`}
      >
        {char}
      </div>
    ));
  };

  return (
    
    <div className="app-container">
      {isFullscreenEnabled && !document.fullscreenElement && (
  <div className="fullscreen-warning">
    <p>Please stay in fullscreen to play the game.</p>
  </div>
)}
      {showIntro ? (
      <div className="intro-screen fade-in">
         <div className="app-icon bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="a" x1="12" x2="12" y1="1.25" y2="22.75" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#a3a3ff" />
                <stop offset="1" stopColor="#1f1fff" />
              </linearGradient>
            </defs>
            <g fill="url(#a)" fillRule="evenodd" clipRule="evenodd">
              <path d="M13.25 14a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-.75.75h-8a.75.75 0 0 1-.75-.75zm1.5.75v6.5h6.5v-6.5zM6.5 1.25a.75.75 0 0 1 .654.382l4.5 8A.75.75 0 0 1 11 10.75H2a.75.75 0 0 1-.654-1.118l4.5-8A.75.75 0 0 1 6.5 1.25zm-3.218 8h6.436L6.5 3.53zM13.25 6a4.75 4.75 0 1 1 9.5 0 4.75 4.75 0 0 1-9.5 0zM18 2.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM1.47 13.47a.75.75 0 0 1 1.06 0l8 8a.75.75 0 1 1-1.06 1.06l-8-8a.75.75 0 0 1 0-1.06z" />
              <path d="M10.53 13.47a.75.75 0 0 1 0 1.06l-8 8a.75.75 0 0 1-1.06-1.06l8-8a.75.75 0 0 1 1.06 0z" />
            </g>
          </svg>
        </div>
        <h1 className="intro-title">Ready to Play?</h1>
        <p className="intro-text">Test your luck. Guess the secret number!</p>
        <button className="play-button pulse" onClick={handlePlay}>
          Play
        </button>
      </div>
    ) : (
      <div className="game-box animate-pop">
        <div className="app-icon bounce">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="a" x1="12" x2="12" y1="1.25" y2="22.75" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#a3a3ff" />
                <stop offset="1" stopColor="#1f1fff" />
              </linearGradient>
            </defs>
            <g fill="url(#a)" fillRule="evenodd" clipRule="evenodd">
              <path d="M13.25 14a.75.75 0 0 1 .75-.75h8a.75.75 0 0 1 .75.75v8a.75.75 0 0 1-.75.75h-8a.75.75 0 0 1-.75-.75zm1.5.75v6.5h6.5v-6.5zM6.5 1.25a.75.75 0 0 1 .654.382l4.5 8A.75.75 0 0 1 11 10.75H2a.75.75 0 0 1-.654-1.118l4.5-8A.75.75 0 0 1 6.5 1.25zm-3.218 8h6.436L6.5 3.53zM13.25 6a4.75 4.75 0 1 1 9.5 0 4.75 4.75 0 0 1-9.5 0zM18 2.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5zM1.47 13.47a.75.75 0 0 1 1.06 0l8 8a.75.75 0 1 1-1.06 1.06l-8-8a.75.75 0 0 1 0-1.06z" />
              <path d="M10.53 13.47a.75.75 0 0 1 0 1.06l-8 8a.75.75 0 0 1-1.06-1.06l8-8a.75.75 0 0 1 1.06 0z" />
            </g>
          </svg>
        </div>
        <h1 className="title">🎲 Guess the Number!</h1>
        <p className="subtitle">Pick a number between 1 and 1000 🎯</p>

        {!gameOver ? (
          <form onSubmit={handleSubmit} className="form-pop">
            <input
              type="number"
              min="1" max="1000"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              required
              ref={inputRef}
              className="guess-input"
              placeholder="Type your guess"
            />

            <div className="seven-segment-wrapper">
              {renderSegments()}
            </div>

            <button
              type="submit"
              className="guess-button playful"
              ref={buttonRef}
              
            >
              🎉 Submit
            </button>
          </form>
        ) : (
          <div className="seven-segment-wrapper">
            {[...'CRCT'].map((c, i) => (
              <div key={i} className="segment-digit">{c}</div>
            ))}
          </div>
        )}
      </div>
       )}
      
    </div>
  );
}

export default App;
