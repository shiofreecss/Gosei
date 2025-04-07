import React, { useState, useEffect, useRef } from 'react';
import GoBoard from './GoBoard';
import KifuSettings from './KifuSettings';
import { ParsedGame, parseSGF, movesToStones } from '../utils/sgfParser';
import { applyMove, createBoardFromStones, getHandicapPositions, findCapturedStones, Position } from '../utils/goRules';

interface KifuReaderProps {
  sgfContent: string;
}

// Define the interface for KifuSettings props to match the actual component
interface KifuSettingsProps {
  showMoveNumbers: boolean;
  onToggleMoveNumbers: () => void;
  enableSound: boolean;
  onToggleSound: () => void;
  autoplaySpeed?: number;
  onAutoplaySpeedChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  const [capturedStones, setCapturedStones] = useState<{x: number, y: number, color: 'black' | 'white', moveNumber: number}[]>([]);

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
      setCapturedStones([]);
      
      // If the game has handicap but no explicit handicap stones, generate them
      if (parsed.info.handicap > 1 && 
          (!parsed.handicapStones || parsed.handicapStones.length === 0)) {
        parsed.handicapStones = getHandicapPositions(
          parsed.info.size,
          parsed.info.handicap
        );
      }
      
      // Pre-calculate captures for each move
      if (parsed.moves.length > 0) {
        calculateAllCaptures(parsed);
      }
    } catch (err) {
      setError('Error parsing SGF file. Please check the format.');
      console.error(err);
    }
  }, [sgfContent]);

  // Calculate captures for all moves in the game
  const calculateAllCaptures = (parsedGame: ParsedGame) => {
    const size = parsedGame.info.size;
    let board = createBoardFromStones(
      movesToStones([], parsedGame.handicapStones), 
      size
    );
    
    const allCapturedStones: {x: number, y: number, color: 'black' | 'white', moveNumber: number}[] = [];
    
    // Process each move and find captures
    parsedGame.moves.forEach((move, index) => {
      // Skip pass moves
      if (move.x < 0 || move.y < 0) return;
      
      // Find stones that would be captured by this move
      const capturedPositions = findCapturedStones(board, {
        x: move.x,
        y: move.y,
        color: move.color
      });
      
      // Record captured stones with their color (opposite of current move)
      // Use a proper type assertion to ensure type safety
      const capturedColor: 'black' | 'white' = move.color === 'black' ? 'white' : 'black';
      const moveNumber = index + 1;
      
      const capturedStonesWithMetadata = capturedPositions.map(pos => ({
        x: pos.x,
        y: pos.y,
        color: capturedColor,
        moveNumber
      }));
      
      // Add to the total captured stones list
      allCapturedStones.push(...capturedStonesWithMetadata);
      
      // Store captures in the move object for future reference
      move.captures = capturedPositions.map(pos => ({
        x: pos.x,
        y: pos.y
      }));
      
      // Apply the move to the board
      const { newBoard } = applyMove(board, {
        x: move.x,
        y: move.y,
        color: move.color
      });
      
      board = newBoard;
    });
    
    setCapturedStones(allCapturedStones);
    // Update the modified game with capture information
    setGame({...parsedGame});
  };

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

  // Effect for updating capture counts when current move changes
  useEffect(() => {
    if (game && capturedStones.length > 0) {
      updateCaptureCount(currentMove);
    }
  }, [currentMove, capturedStones]);

  const updateCaptureCount = (moveIndex: number) => {
    // Count captures up to the current move
    const relevantCaptures = capturedStones.filter(
      stone => stone.moveNumber <= moveIndex + 1
    );
    
    const whiteCaptured = relevantCaptures.filter(stone => stone.color === 'white').length;
    const blackCaptured = relevantCaptures.filter(stone => stone.color === 'black').length;
    
    setCapturedWhite(whiteCaptured);
    setCapturedBlack(blackCaptured);
  };

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

  const handleMoveChange = (newMoveIndex: number) => {
    if (!game) return;
    
    if (newMoveIndex >= -1 && newMoveIndex < game.moves.length) {
      setCurrentMove(newMoveIndex);
      playStoneSound();
    }
  };

  const playStoneSound = () => {
    if (enableSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Error playing sound', e));
    }
  };

  // Filter captured stones based on the current move
  const visibleCapturedStones = capturedStones.filter(
    stone => stone.moveNumber <= currentMove + 1
  );

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
            gap: '20px',
            alignItems: 'flex-start', 
            maxWidth: '100%'
          }}>
            {/* LEFT SIDE - Go Board */}
            <div className="board-container" style={{ 
              width: '60%',
              minWidth: '480px', 
              backgroundColor: 'rgba(249, 249, 249, 0.5)',
              padding: '25px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>
              <GoBoard 
                size={game.info.size} 
                stones={movesToStones(
                  currentMove >= 0 ? game.moves.slice(0, currentMove + 1) : [],
                  game.handicapStones
                )} 
                currentMove={currentMove}
                showMoveNumbers={showMoveNumbers}
                capturedStones={visibleCapturedStones}
              />
            </div>
            
            {/* RIGHT SIDE - Game Info and Controls */}
            <div className="controls-container" style={{ 
              width: '35%',
              minWidth: '330px',
              display: 'flex', 
              flexDirection: 'column',
              gap: '15px'
            }}>
              {/* Settings Panel - Moved to top */}
              <KifuSettings
                autoplaySpeed={autoplaySpeed}
                onAutoplaySpeedChange={handleAutoplaySpeedChange}
                showMoveNumbers={showMoveNumbers}
                onToggleMoveNumbers={handleToggleMoveNumbers}
                enableSound={enableSound}
                onToggleSound={handleToggleSound}
              />
              
              {/* Game Information */}
              <div className="game-info" style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '15px',
                  marginBottom: '15px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      fontSize: '18px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: 'black' 
                      }}></span>
                      {game.info.playerBlack}
                    </div>
                    <div style={{ 
                      fontSize: '16px',
                      color: '#444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5L5 19M19 19L5 5" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Captures: <strong>{capturedWhite}</strong>
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      justifyContent: 'flex-end',
                      fontSize: '18px',
                      marginBottom: '8px'
                    }}>
                      {game.info.playerWhite}
                      <span style={{ 
                        display: 'inline-block', 
                        width: '18px', 
                        height: '18px', 
                        borderRadius: '50%', 
                        backgroundColor: 'white',
                        border: '1px solid #888'
                      }}></span>
                    </div>
                    <div style={{ 
                      fontSize: '16px',
                      color: '#444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '5px'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 5L5 19M19 19L5 5" stroke="#444" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Captures: <strong>{capturedBlack}</strong>
                    </div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  color: '#333',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Komi: {game.info.komi}
                  </div>
                  <div style={{ 
                    backgroundColor: '#f9f9f9', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    Size: {game.info.size}×{game.info.size}
                  </div>
                  {game.info.handicap > 1 && (
                    <div style={{ 
                      backgroundColor: '#f9f9f9', 
                      padding: '8px 12px', 
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}>
                      Handicap: {game.info.handicap}
                    </div>
                  )}
                </div>
                
                {/* Current move comment */}
                {currentMoveInfo?.comment && (
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: '#f5f9ff',
                    borderRadius: '6px',
                    fontSize: '16px',
                    lineHeight: '1.5',
                    border: '1px solid #e0e8f5'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#444' }}>Comment:</div>
                    {currentMoveInfo.comment}
                  </div>
                )}
              </div>
              
              {/* Navigation Controls */}
              <div className="navigation-container" style={{ 
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div className="move-slider" style={{ 
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '15px'
                }}>
                  <button
                    onClick={handleFirstMove}
                    style={{
                      padding: '12px',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    aria-label="Go to first move"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 20H17V4H19V20ZM15 12L5 4V20L15 12Z" fill="#333"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={handlePrevMove}
                    style={{
                      padding: '12px',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    aria-label="Previous move"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 6L9 12L15 18V6Z" fill="#333"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={toggleAutoplay}
                    style={{
                      padding: '12px 16px',
                      border: 'none',
                      backgroundColor: autoplayActive ? '#4CAF50' : '#f0f0f0',
                      color: autoplayActive ? 'white' : '#333',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}
                    aria-label={autoplayActive ? "Pause autoplay" : "Start autoplay"}
                  >
                    {autoplayActive ? (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor"/>
                        </svg>
                        Pause
                      </>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                        </svg>
                        Play
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleNextMove}
                    style={{
                      padding: '12px',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    aria-label="Next move"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6V18Z" fill="#333"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleLastMove}
                    style={{
                      padding: '12px',
                      border: 'none',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                    aria-label="Go to last move"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 20L15 12L5 4V20ZM19 4V20H17V4H19Z" fill="#333"/>
                    </svg>
                  </button>
                </div>
              
                <div style={{
                  flex: 1,
                  position: 'relative',
                  marginBottom: '20px'
                }}>
                  <input
                    type="range"
                    min="-1"
                    max={game.moves.length - 1}
                    value={currentMove}
                    onChange={(e) => handleMoveChange(parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      height: '12px',
                      appearance: 'none',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '6px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    aria-label="Move slider"
                  />
                  <div style={{
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    color: '#333',
                    fontWeight: '500'
                  }}>
                    <span>Start</span>
                    <span>Move {currentMove + 1} / {game.moves.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KifuReader; 