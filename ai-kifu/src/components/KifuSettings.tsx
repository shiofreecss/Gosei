import React from 'react';

interface KifuSettingsProps {
  showMoveNumbers: boolean;
  enableSound: boolean;
  showCapturedStones?: boolean;
  onToggleMoveNumbers: () => void;
  onToggleSound: () => void;
  onToggleCapturedStones?: () => void;
  onShowHandicapSettings?: () => void;
}

const KifuSettings: React.FC<KifuSettingsProps> = ({ 
  showMoveNumbers, 
  enableSound, 
  showCapturedStones = false,
  onToggleMoveNumbers, 
  onToggleSound,
  onToggleCapturedStones,
  onShowHandicapSettings
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        margin: '0 0 15px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Display Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8v8M8 12h8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: '500', color: '#444' }}>Show Move Numbers</span>
          </div>
          
          <button 
            onClick={onToggleMoveNumbers}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              backgroundColor: showMoveNumbers ? '#4CAF50' : '#ccc',
              borderRadius: '12px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            aria-pressed={showMoveNumbers}
          >
            <span 
              style={{
                position: 'absolute',
                left: showMoveNumbers ? '22px' : '2px',
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9.9669C2 9.9669 8.5 3 12 3C15.5 3 22 9.9669 22 9.9669" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 14.9669C2 14.9669 8.5 21.5 12 21.5C15.5 21.5 22 14.9669 22 14.9669" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12.5" r="2.5" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: '500', color: '#444' }}>Enable Sound</span>
          </div>
          
          <button 
            onClick={onToggleSound}
            style={{
              position: 'relative',
              width: '44px',
              height: '24px',
              backgroundColor: enableSound ? '#4CAF50' : '#ccc',
              borderRadius: '12px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            aria-pressed={enableSound}
          >
            <span 
              style={{
                position: 'absolute',
                left: enableSound ? '22px' : '2px',
                width: '20px',
                height: '20px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </button>
        </div>
        
        {onToggleCapturedStones && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2"/>
                <path d="M8 8l8 8M16 8l-8 8" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#444' }}>Show Captured Stones</span>
            </div>
            
            <button 
              onClick={onToggleCapturedStones}
              style={{
                position: 'relative',
                width: '44px',
                height: '24px',
                backgroundColor: showCapturedStones ? '#4CAF50' : '#ccc',
                borderRadius: '12px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              aria-pressed={showCapturedStones}
            >
              <span 
                style={{
                  position: 'absolute',
                  left: showCapturedStones ? '22px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }}
              />
            </button>
          </div>
        )}
        
        {onShowHandicapSettings && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#555" strokeWidth="2"/>
                <circle cx="8" cy="8" r="2" fill="#555"/>
                <circle cx="16" cy="8" r="2" fill="#555"/>
                <circle cx="16" cy="16" r="2" fill="#555"/>
                <circle cx="8" cy="16" r="2" fill="#555"/>
                <circle cx="12" cy="12" r="2" fill="#555"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#444' }}>Handicap Settings</span>
            </div>
            
            <button 
              onClick={onShowHandicapSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 12px',
                backgroundColor: '#f0f0f0',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#555'
              }}
            >
              Configure
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KifuSettings; 