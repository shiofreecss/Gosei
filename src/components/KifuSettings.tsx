import React from 'react';
import type { BoardTheme } from './GoBoard';

interface KifuSettingsProps {
  showMoveNumbers: boolean;
  enableSound: boolean;
  showCapturedStones?: boolean;
  boardTheme?: BoardTheme;
  onToggleMoveNumbers: () => void;
  onToggleSound: () => void;
  onToggleCapturedStones?: () => void;
  onShowHandicapSettings?: () => void;
  onBoardThemeChange?: (theme: BoardTheme) => void;
  autoplaySpeed?: number;
  onAutoplaySpeedChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const KifuSettings: React.FC<KifuSettingsProps> = ({ 
  showMoveNumbers, 
  enableSound, 
  showCapturedStones = false,
  boardTheme = 'default',
  onToggleMoveNumbers, 
  onToggleSound,
  onToggleCapturedStones,
  onShowHandicapSettings,
  onBoardThemeChange,
  autoplaySpeed = 1000,
  onAutoplaySpeedChange
}) => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{ 
        margin: '0 0 15px',
        fontSize: '20px',
        fontWeight: '600',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Display Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Board Theme Dropdown Selector */}
        {onBoardThemeChange && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="3" y1="15" x2="21" y2="15" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="9" y1="3" x2="9" y2="21" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="15" y1="3" x2="15" y2="21" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Board Theme</span>
            </div>
            
            <select
              value={boardTheme}
              onChange={(e) => onBoardThemeChange(e.target.value as BoardTheme)}
              style={{
                appearance: 'none',
                padding: '8px 30px 8px 12px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '6px',
                backgroundColor: 'white',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                width: '160px'
              }}
              aria-label="Select board theme"
            >
              <option value="default">Default Board</option>
              <option value="dark-wood-3d">Dark Wood 3D</option>
              <option value="light-wood-3d">Light Wood 3D</option>
              <option value="universe">Universe</option>
            </select>
          </div>
        )}
      
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 10px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8v8M8 12h8" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Show Move Numbers</span>
          </div>
          
          <button 
            onClick={onToggleMoveNumbers}
            style={{
              position: 'relative',
              width: '52px',
              height: '28px',
              backgroundColor: showMoveNumbers ? '#4CAF50' : '#ccc',
              borderRadius: '14px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            aria-pressed={showMoveNumbers}
            aria-label={showMoveNumbers ? "Hide move numbers" : "Show move numbers"}
          >
            <span 
              style={{
                position: 'absolute',
                left: showMoveNumbers ? '26px' : '2px',
                width: '24px',
                height: '24px',
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
          padding: '12px 10px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 9.9669C2 9.9669 8.5 3 12 3C15.5 3 22 9.9669 22 9.9669" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 14.9669C2 14.9669 8.5 21.5 12 21.5C15.5 21.5 22 14.9669 22 14.9669" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12.5" r="2.5" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Enable Sound</span>
          </div>
          
          <button 
            onClick={onToggleSound}
            style={{
              position: 'relative',
              width: '52px',
              height: '28px',
              backgroundColor: enableSound ? '#4CAF50' : '#ccc',
              borderRadius: '14px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            aria-pressed={enableSound}
            aria-label={enableSound ? "Turn sound off" : "Turn sound on"}
          >
            <span 
              style={{
                position: 'absolute',
                left: enableSound ? '26px' : '2px',
                width: '24px',
                height: '24px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}
            />
          </button>
        </div>
        
        {onAutoplaySpeedChange && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            padding: '12px 10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L13 6M21 10V14M11 22L11 18M3 14L3 10M13 10C13 11.6569 11.6569 13 10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10Z" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Autoplay Speed</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '15px',
              padding: '0 5px'
            }}>
              <span style={{ fontSize: '14px', color: '#444', fontWeight: '500' }}>Slow</span>
              <input 
                type="range" 
                min="0" 
                max="2000" 
                value={3000 - autoplaySpeed}
                onChange={onAutoplaySpeedChange}
                style={{ 
                  flex: 1,
                  height: '8px',
                  appearance: 'none',
                  backgroundColor: '#ddd',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Adjust autoplay speed"
              />
              <span style={{ fontSize: '14px', color: '#444', fontWeight: '500' }}>Fast</span>
            </div>
          </div>
        )}
        
        {onToggleCapturedStones && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px 10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2"/>
                <path d="M8 8l8 8M16 8l-8 8" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Show Captured Stones</span>
            </div>
            
            <button 
              onClick={onToggleCapturedStones}
              style={{
                position: 'relative',
                width: '52px',
                height: '28px',
                backgroundColor: showCapturedStones ? '#4CAF50' : '#ccc',
                borderRadius: '14px',
                border: 'none',
                outline: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                display: 'flex',
                alignItems: 'center',
                padding: '2px'
              }}
              aria-pressed={showCapturedStones}
              aria-label={showCapturedStones ? "Hide captured stones" : "Show captured stones"}
            >
              <span 
                style={{
                  position: 'absolute',
                  left: showCapturedStones ? '26px' : '2px',
                  width: '24px',
                  height: '24px',
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
            padding: '12px 10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="3" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="6" r="3" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="18" cy="18" r="3" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#333', fontSize: '16px' }}>Handicap Settings</span>
            </div>
            
            <button 
              onClick={onShowHandicapSettings}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              aria-label="Show handicap settings"
            >
              Configure
              <svg width="14" height="14" style={{ marginLeft: '5px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18l6-6-6-6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KifuSettings; 