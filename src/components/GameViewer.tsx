import React from 'react';
import KifuReader from './KifuReader';
import './GameViewer.css';

interface GameViewerProps {
  sgfContent: string;
  onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ sgfContent, onClose }) => {
  return (
    <div className="game-viewer">
      <div className="game-viewer-modal">
        <button 
          className="game-viewer-close"
          onClick={onClose}
        >
          &times;
        </button>
        
        <h2 className="game-viewer-header">Game Viewer</h2>
        <KifuReader sgfContent={sgfContent} />
      </div>
    </div>
  );
};

export default GameViewer; 