import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glitchText, setGlitchText] = useState('404');

  useEffect(() => {
    // Glitch effect
    const glitchInterval = setInterval(() => {
      const glitchChars = ['4', '0', '4', '?', '!', '@', '#', '$'];
      const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
      setGlitchText(randomChar + '0' + randomChar);
      setTimeout(() => setGlitchText('404'), 100);
    }, 2000);

    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="not-found-container">
      <div className="not-found-content" style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`
      }}>
        {/* Floating emojis */}
        <div className="floating-emoji emoji-1">😵</div>
        <div className="floating-emoji emoji-2">🤔</div>
        <div className="floating-emoji emoji-3">😅</div>
        <div className="floating-emoji emoji-4">🙃</div>
        <div className="floating-emoji emoji-5">🤷</div>
        <div className="floating-emoji emoji-6">😱</div>

        {/* Main 404 text with glitch effect */}
        <div className="not-found-number">
          <span className="glitch" data-text={glitchText}>{glitchText}</span>
        </div>

        {/* Bouncing text */}
        <h1 className="bounce-text">Oops! Page Not Found</h1>
        
        <p className="not-found-message">
          Looks like this page went on a coffee break ☕
        </p>
        <p className="not-found-submessage">
          Or maybe it's just hiding from you... 🕵️
        </p>

        {/* Animated buttons */}
        <div className="not-found-actions">
          <button 
            className="btn-home" 
            onClick={() => navigate('/dashboard')}
          >
            🏠 Go Home
          </button>
          <button 
            className="btn-back" 
            onClick={() => navigate(-1)}
          >
            ⬅️ Go Back
          </button>
        </div>

        {/* Spinning loader */}
        <div className="spinner-container">
          <div className="spinner"></div>
          <p className="spinner-text">Searching for your page...</p>
        </div>
      </div>

      {/* Background particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}></div>
        ))}
      </div>
    </div>
  );
};

export default NotFound;
