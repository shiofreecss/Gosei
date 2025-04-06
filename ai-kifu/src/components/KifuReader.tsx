import React, { useState, useEffect, useRef } from 'react';
import GoBoard from './GoBoard';
import KifuSettings from './KifuSettings';
import { ParsedGame, parseSGF, movesToStones } from '../utils/sgfParser';
import { applyMove, createBoardFromStones, getHandicapPositions } from '../utils/goRules';

interface KifuReaderProps {
  sgfContent: string;
}

const KifuReader: React.FC<KifuReaderProps> = ({ sgfContent }) => {
  const [game, setGame] = useState<ParsedGame | null>(null);
  const [currentMove, setCurrentMove] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [autoplayActive, setAutoplayActive] = useState<boolean>(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(1000); // ms between moves
  
  // New state for toggles
  const [showMoveNumbers, setShowMoveNumbers] = useState<boolean>(false);
  const [enableSound, setEnableSound] = useState<boolean>(false);
  
  // Reference for audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [capturedWhite, setCapturedWhite] = useState(0);
  const [capturedBlack, setCapturedBlack] = useState(0);

  useEffect(() => {
    // Create audio element for move sounds
    audioRef.current = new Audio('/stone-sound.mp3');
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    try {
      const parsed = parseSGF(sgfContent);
      setGame(parsed);
      setCurrentMove(-1); // Reset to beginning
      setError(null);
      setCapturedBlack(0);
      setCapturedWhite(0);
      
      // If the game has handicap but no explicit handicap stones, generate them
      if (parsed.info.handicap > 1 && 
          (!parsed.handicapStones || parsed.handicapStones.length === 0)) {
        parsed.handicapStones = getHandicapPositions(
          parsed.info.size,
          parsed.info.handicap
        );
      }
    } catch (err) {
      setError('Error parsing SGF file. Please check the format.');
      console.error(err);
    }
  }, [sgfContent]);

  useEffect(() => {
    let autoplayTimer: NodeJS.Timeout | null = null;
    
    if (autoplayActive && game) {
      if (currentMove < game.moves.length - 1) {
        autoplayTimer = setTimeout(() => {
          setCurrentMove(prev => prev + 1);
        }, autoplaySpeed);
      } else {
        setAutoplayActive(false);
      }
    }
    
    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  }, [autoplayActive, currentMove, game, autoplaySpeed]);

  // Effect for playing sound on move change
  useEffect(() => {
    if (enableSound && currentMove >= 0 && audioRef.current) {
      // Reset audio to start and play
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log("Error playing sound:", e));
    }
  }, [currentMove, enableSound]);

  const handlePrevMove = () => {
    setAutoplayActive(false);
    setCurrentMove(prev => Math.max(-1, prev - 1));
  };

  const handleNextMove = () => {
    setAutoplayActive(false);
    if (game) {
      setCurrentMove(prev => Math.min(game.moves.length - 1, prev + 1));
    }
  };

  const handleFirstMove = () => {
    setAutoplayActive(false);
    setCurrentMove(-1);
  };

  const handleLastMove = () => {
    setAutoplayActive(false);
    if (game) {
      setCurrentMove(game.moves.length - 1);
    }
  };

  const toggleAutoplay = () => {
    setAutoplayActive(prev => !prev);
  };

  const handleAutoplaySpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoplaySpeed(3000 - parseInt(e.target.value, 10));
  };

  const handleToggleMoveNumbers = () => {
    setShowMoveNumbers(prev => !prev);
  };

  const handleToggleSound = () => {
    setEnableSound(prev => !prev);
  };

  const getCurrentMoveInfo = () => {
    if (!game || currentMove < 0) return null;
    return game.moves[currentMove];
  };

  const currentMoveInfo = getCurrentMoveInfo();

  // Calculate captures for a particular move
  const calculateCaptures = (moveIndex: number) => {
    if (!game) return;
    
    // Reset captures
    let whiteCaptured = 0;
    let blackCaptured = 0;
    
    // Handle handicap stones
    const allStones = movesToStones(
      moveIndex >= 0 ? game.moves.slice(0, moveIndex + 1) : [],
      game.handicapStones
    );
    
    // Create board representation
    const board = createBoardFromStones(allStones, game.info.size);
    
    // Calculate captures up to the current move
    for (let i = 0; i <= moveIndex; i++) {
      const move = game.moves[i];
      
      // Skip if invalid move coordinates
      if (move.x < 0 || move.y < 0) continue;
      
      // Check for stored captures in the move object
      if (move.captures && move.captures.length > 0) {
        if (move.color === 'black') {
          whiteCaptured += move.captures.length;
        } else {
          blackCaptured += move.captures.length;
        }
      }
    }
    
    setCapturedWhite(whiteCaptured);
    setCapturedBlack(blackCaptured);
  };

  const handleMoveChange = (newMoveIndex: number) => {
    if (!game) return;
    
    if (newMoveIndex >= -1 && newMoveIndex < game.moves.length) {
      setCurrentMove(newMoveIndex);
      calculateCaptures(newMoveIndex);
      playStoneSound();
    }
  };

  const playStoneSound = () => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Error playing sound', e));
    }
  };

  return (
    <div className="kifu-reader" style={{ fontFamily: 'inherit' }}>
      {error && (
        <div className="error" style={{ 
          color: '#e74c3c', 
          padding: '12px 15px', 
          backgroundColor: '#fdedeb', 
          borderRadius: '6px', 
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12M12 16V16.01M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {error}
        </div>
      )}
      
      {game && (
        <>
          <div className="kifu-content" style={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '30px' 
          }}>
            <div className="board-container" style={{ 
              flex: '1 1 500px',
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: 'rgba(249, 249, 249, 0.5)',
              padding: '25px',
              borderRadius: '8px'
            }}>
              <GoBoard 
                size={game.info.size} 
                stones={movesToStones(
                  currentMove >= 0 ? game.moves.slice(0, currentMove + 1) : [],
                  game.handicapStones
                )} 
                currentMove={currentMove}
                showMoveNumbers={showMoveNumbers}
              />
              
              <div className="navigation-container" style={{ 
                width: '100%', 
                marginTop: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div className="move-slider" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: '15px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    color: '#555' 
                  }}>1</span>
                  <input 
                    type="range" 
                    min="-1" 
                    max={game.moves.length - 1} 
                    value={currentMove}
                    onChange={(e) => setCurrentMove(parseInt(e.target.value, 10))}
                    style={{ 
                      flex: 1,
                      height: '6px',
                      appearance: 'none',
                      backgroundColor: '#ddd',
                      borderRadius: '3px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    color: '#555'
                  }}>{game.moves.length}</span>
                </div>
                
                <div className="controls" style={{ 
                  display: 'flex', 
                  gap: '10px',
                  justifyContent: 'center',
                  marginTop: '5px'
                }}>
                  <button 
                    onClick={handleFirstMove} 
                    disabled={currentMove < 0}
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: currentMove < 0 ? '#f0f0f0' : '#fff',
                      color: currentMove < 0 ? '#999' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: currentMove < 0 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '40px',
                      height: '40px'
                    }}
                    title="First move"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 7V17M18 7L10 12L18 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    onClick={handlePrevMove} 
                    disabled={currentMove < 0}
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: currentMove < 0 ? '#f0f0f0' : '#fff',
                      color: currentMove < 0 ? '#999' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: currentMove < 0 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '40px',
                      height: '40px'
                    }}
                    title="Previous move"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={toggleAutoplay} 
                    style={{ 
                      padding: '8px 14px',
                      backgroundColor: autoplayActive ? '#4a4a4a' : '#fff',
                      color: autoplayActive ? '#fff' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      transition: 'all 0.2s',
                      width: 'auto',
                      minWidth: '100px'
                    }}
                    title={autoplayActive ? "Pause" : "Autoplay"}
                  >
                    {autoplayActive ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 9V15M14 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16.6582 9.28638C17.1176 9.63991 17.1176 10.3601 16.6582 10.7136L9.5 15.6329C9 16 8.5 15.5 8.5 15V5C8.5 4.5 9 4 9.5 4.36709L16.6582 9.28638Z" fill="currentColor"/>
                          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                  
                  <button 
                    onClick={handleNextMove} 
                    disabled={currentMove >= game.moves.length - 1}
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: currentMove >= game.moves.length - 1 ? '#f0f0f0' : '#fff',
                      color: currentMove >= game.moves.length - 1 ? '#999' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: currentMove >= game.moves.length - 1 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '40px',
                      height: '40px'
                    }}
                    title="Next move"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button 
                    onClick={handleLastMove} 
                    disabled={currentMove >= game.moves.length - 1}
                    style={{ 
                      padding: '8px 12px',
                      backgroundColor: currentMove >= game.moves.length - 1 ? '#f0f0f0' : '#fff',
                      color: currentMove >= game.moves.length - 1 ? '#999' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      cursor: currentMove >= game.moves.length - 1 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                      width: '40px',
                      height: '40px'
                    }}
                    title="Last move"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 17V7M6 17L14 12L6 7V17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                {autoplayActive && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    margin: '10px 0',
                    justifyContent: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L13 6M21 10V14M11 22L11 18M3 14L3 10M13 10C13 11.6569 11.6569 13 10 13C8.34315 13 7 11.6569 7 10C7 8.34315 8.34315 7 10 7C11.6569 7 13 8.34315 13 10ZM21 18C21 19.6569 19.6569 21 18 21C16.3431 21 15 19.6569 15 18C15 16.3431 16.3431 15 18 15C19.6569 15 21 16.3431 21 18ZM7 18C7 19.6569 5.65685 21 4 21C2.34315 21 1 19.6569 1 18C1 16.3431 2.34315 15 4 15C5.65685 15 7 16.3431 7 18ZM7 2C7 3.65685 5.65685 5 4 5C2.34315 5 1 3.65685 1 2C1 0.343146 2.34315 -1 4 -1C5.65685 -1 7 0.343146 7 2Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Speed
                    </span>
                    <div style={{ 
                      position: 'relative', 
                      width: '150px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="2000" 
                        value={3000 - autoplaySpeed}
                        onChange={handleAutoplaySpeedChange}
                        style={{ 
                          width: '100%',
                          height: '4px',
                          appearance: 'none',
                          backgroundColor: '#ddd',
                          borderRadius: '2px',
                          outline: 'none',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      />
                      <div 
                        style={{
                          position: 'absolute',
                          top: '-3px',
                          left: '0',
                          right: '0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          pointerEvents: 'none'
                        }}
                      >
                        <span style={{ fontSize: '10px', color: '#888' }}>Slow</span>
                        <span style={{ fontSize: '10px', color: '#888' }}>Fast</span>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: '13px', 
                      color: '#666',
                      width: '50px',
                      textAlign: 'center'
                    }}>
                      {autoplaySpeed < 500 ? 'Fast' : autoplaySpeed < 1500 ? 'Medium' : 'Slow'}
                    </span>
                  </div>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px',
                  backgroundColor: currentMove >= 0 ? 'rgba(0,0,0,0.03)' : 'transparent',
                  borderRadius: '6px',
                  marginTop: '10px'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'normal',
                    color: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {currentMove >= 0 ? (
                      <>
                        <span style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: currentMoveInfo?.color === 'black' ? '#000' : '#fff',
                          border: '1px solid #ddd',
                          display: 'inline-block'
                        }}></span>
                        Move {currentMove + 1}: {currentMoveInfo?.color === 'black' ? 'Black' : 'White'} 
                        ({String.fromCharCode(65 + currentMoveInfo!.x)}{currentMoveInfo!.y + 1})
                      </>
                    ) : (
                      'Start of game'
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="game-info-container" style={{ 
              flex: '1 1 300px'
            }}>
              <KifuSettings 
                showMoveNumbers={showMoveNumbers}
                enableSound={enableSound}
                onToggleMoveNumbers={handleToggleMoveNumbers}
                onToggleSound={handleToggleSound}
              />
              
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                    <path d="M12 6V12L16 14M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Game Information
                </h3>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '4px'
                  }}>
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: 'black' 
                    }}></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>Black</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{game.info.playerBlack} {capturedBlack > 0 && <span> (Captured: {capturedBlack})</span>}</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    borderRadius: '4px'
                  }}>
                    <span style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      backgroundColor: 'white',
                      border: '1px solid #ddd'
                    }}></span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '500' }}>White</div>
                      <div style={{ fontSize: '14px', color: '#666' }}>{game.info.playerWhite} {capturedWhite > 0 && <span> (Captured: {capturedWhite})</span>}</div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px',
                    marginTop: '5px'
                  }}>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#777' }}>Date:</span> {game.info.date || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#777' }}>Result:</span> {game.info.result || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#777' }}>Komi:</span> {game.info.komi}
                    </div>
                    <div style={{ fontSize: '14px' }}>
                      <span style={{ color: '#777' }}>Board:</span> {game.info.size}×{game.info.size}
                    </div>
                  </div>
                </div>
              </div>
              
              {currentMoveInfo && currentMoveInfo.comment && (
                <div style={{ 
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
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
                      <path d="M8 10H16M8 14H13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Move Comment
                  </h3>
                  <div style={{ 
                    fontSize: '14px',
                    lineHeight: '1.6',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    padding: '12px 15px',
                    borderRadius: '6px',
                    color: '#444'
                  }}>
                    {currentMoveInfo.comment}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hidden audio element for stone sound */}
          <audio 
            src="/stone-sound.mp3" 
            style={{ display: 'none' }} 
            preload="auto"
            ref={audioRef}
          />
        </>
      )}
    </div>
  );
};

export default KifuReader; 