import React from 'react';
import KifuReader from './KifuReader';

interface GameViewerProps {
  sgfContent: string;
  onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ sgfContent, onClose }) => {
  return (
    <div className="game-viewer" style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '1000px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative',
        padding: '25px'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#333',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'background-color 0.2s'
          }}
        >
          &times;
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Game Viewer</h2>
        <KifuReader sgfContent={sgfContent} />
      </div>
    </div>
  );
};

export default GameViewer; 