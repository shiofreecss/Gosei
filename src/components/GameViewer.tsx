import React, { useEffect, useState } from 'react';
import KifuReader from './KifuReader';
import './GameViewer.css';

interface GameViewerProps {
  sgfContent: string;
  onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ sgfContent, onClose }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Set loading false after a short delay to ensure the component is rendered
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen) {
      setIsFullScreen(false);
    } else if (e.key === 'Escape' && !isFullScreen) {
      onClose();
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);
  
  return (
    <div className={`game-viewer ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="game-viewer-modal">
        <div className="game-viewer-actions">
          <button 
            className="game-viewer-fullscreen"
            onClick={toggleFullScreen}
            aria-label={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullScreen ? '⤾' : '⤢'}
          </button>
          <button 
            className="game-viewer-close"
            onClick={onClose}
            aria-label="Close game viewer"
            title="Close game viewer"
          >
            &times;
          </button>
        </div>
        
        <h2 className="game-viewer-header">
          {isMobile ? "Game Viewer" : "Professional Game Viewer"}
          {!isMobile && <span className="header-tip">(Press ESC to close)</span>}
        </h2>
        
        {isLoading ? (
          <div className="game-viewer-loading">
            <div className="loading-spinner"></div>
            <p>Loading game...</p>
          </div>
        ) : (
          <KifuReader sgfContent={sgfContent} />
        )}
      </div>
    </div>
  );
};

export default GameViewer; 