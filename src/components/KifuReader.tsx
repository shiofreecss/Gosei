import React, { useState, useEffect, useRef, useMemo } from 'react';
import GoBoard, { BoardTheme } from './GoBoard';
import KifuSettings from './KifuSettings';
import LibertyAnalysis from './LibertyAnalysis';
import WinRateChart from './WinRateChart';
import { ParsedGame, parseSGF, movesToStones } from '../utils/sgfParser';
import { applyMove, createBoardFromStones, getHandicapPositions, findCapturedStones, Position, Stone, isValidMove, isKoSituation } from '../utils/goRules';
import './KifuReader.css';

interface KifuReaderProps {
  sgfContent: string;
}

// Define the interface for KifuSettings props to match the actual component
interface KifuSettingsProps {
  showMoveNumbers: boolean;
  onToggleMoveNumbers: () => void;
  enableSound: boolean;
  onToggleSound: () => void;
  showHeatMap?: boolean;
  onToggleHeatMap?: () => void;
  showLibertyAnalysis?: boolean;
  onToggleLibertyAnalysis?: () => void;
  showWinRateChart?: boolean;
  onToggleWinRateChart?: () => void;
  analysisType?: 'liberty' | 'influence';
  onAnalysisTypeChange?: (type: 'liberty' | 'influence') => void;
  autoplaySpeed?: number;
  onAutoplaySpeedChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  boardTheme?: BoardTheme;
  onBoardThemeChange?: (theme: BoardTheme) => void;
}

const KifuReader: React.FC<KifuReaderProps> = ({ sgfContent }) => {
  const [game, setGame] = useState<ParsedGame | null>(null);
  const [currentMove, setCurrentMove] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const [autoplayActive, setAutoplayActive] = useState<boolean>(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState<number>(1000); // ms between moves
  
  // New state for toggles
  const [showMoveNumbers, setShowMoveNumbers] = useState<boolean>(false);
  const [enableSound, setEnableSound] = useState<boolean>(true);
  const [showHeatMap, setShowHeatMap] = useState<boolean>(false);
  const [showLibertyAnalysis, setShowLibertyAnalysis] = useState<boolean>(false);
  const [showWinRateChart, setShowWinRateChart] = useState<boolean>(false);
  const [analysisType, setAnalysisType] = useState<'liberty' | 'influence'>('liberty');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('light-wood-3d');
  
  // Reference for audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [capturedWhite, setCapturedWhite] = useState(0);
  const [capturedBlack, setCapturedBlack] = useState(0);
  const [capturedStones, setCapturedStones] = useState<{x: number, y: number, color: 'black' | 'white', moveNumber: number}[]>([]);
  
  // Add state to detect mobile viewport
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Add board history state to track previous board positions for Ko detection
  const [boardHistory, setBoardHistory] = useState<('black' | 'white' | null)[][][]>([]);

  // Add state to track Ko position for visual indication
  const [koPosition, setKoPosition] = useState<{x: number, y: number} | null>(null);

  // Add state for Ko explanation
  const [koExplanation, setKoExplanation] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element for move sounds
    audioRef.current = new Audio('/stone-sound.mp3');
    
    // Set up mobile detection
    const checkForMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkForMobile();
    window.addEventListener('resize', checkForMobile);
    
    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('resize', checkForMobile);
    };
  }, []);

  // Load saved theme preference if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('gosei-board-theme');
    if (savedTheme) {
      setBoardTheme(savedTheme as BoardTheme);
    }
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
    
    // Initialize an empty board
    let board = createBoardFromStones(
      movesToStones([], parsedGame.handicapStones), 
      size
    );
    
    const allCapturedStones: {x: number, y: number, color: 'black' | 'white', moveNumber: number}[] = [];
    
    // Initialize board history with the initial board state
    const history: ('black' | 'white' | null)[][][] = [board.map(row => [...row])];
    
    // Process each move and find captures
    parsedGame.moves.forEach((move, index) => {
      // Skip pass moves
      if (move.x < 0 || move.y < 0) {
        // For pass moves, just add the current board state to history
        history.push(board.map(row => [...row]));
        return;
      }
      
      console.log(`Processing move ${index + 1}: ${move.color} at ${move.x},${move.y}`);
      
      // Check if the move is valid, including Ko rule
      if (!isValidMove(board, {
        x: move.x,
        y: move.y,
        color: move.color
      }, history)) {
        // Log invalid move (should not happen with valid SGF files)
        console.warn(`Invalid move detected at move ${index + 1}:`, move);
        
        // Check if it's a Ko situation
        if (isKoSituation(board, {
          x: move.x,
          y: move.y,
          color: move.color
        }, history)) {
          // Mark this move as a Ko situation in the move object for reference
          move.isKoSituation = true;
        }
      }
      
      // Find stones that would be captured by this move
      const capturedPositions = findCapturedStones(board, {
        x: move.x,
        y: move.y,
        color: move.color
      });
      
      // Record captured stones with their color (opposite of current move)
      const capturedColor: 'black' | 'white' = move.color === 'black' ? 'white' : 'black';
      const moveNumber = index + 1;
      
      console.log(`Move ${moveNumber} captures ${capturedPositions.length} stones`);
      
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
      
      // Apply the move to the board - use our applyMove function to ensure proper stone placement
      try {
        const { newBoard } = applyMove(board, {
          x: move.x,
          y: move.y,
          color: move.color
        });
        
        // Validate the new board state
        board = newBoard;
        
        // Double-check that our stone was actually placed
        if (board[move.y][move.x] !== move.color) {
          console.error(`Stone at ${move.x},${move.y} not correctly placed! Fixing manually.`);
          board[move.y][move.x] = move.color;
        }
        
        // Double-check that captured stones were removed
        capturedPositions.forEach(pos => {
          if (board[pos.y][pos.x] !== null) {
            console.error(`Captured stone at ${pos.x},${pos.y} not removed! Fixing manually.`);
            board[pos.y][pos.x] = null;
          }
        });
      } catch (e) {
        console.error(`Error applying move ${index + 1}:`, move, e);
      }
      
      // Add the new board state to history
      history.push(board.map(row => [...row]));
    });
    
    // Set the state with the calculated board history
    setBoardHistory(history);
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
    setKoPosition(null);
    setKoExplanation(null);
    setCurrentMove(prev => Math.max(-1, prev - 1));
  };

  const handleNextMove = () => {
    setAutoplayActive(false);
    if (game && currentMove < game.moves.length - 1) {
      // Get the next move
      const nextMoveIndex = currentMove + 1;
      const nextMove = game.moves[nextMoveIndex];
      
      // Reset Ko position and explanation
      setKoPosition(null);
      setKoExplanation(null);
      
      // Skip validation for pass moves
      if (nextMove.x < 0 || nextMove.y < 0 || !boardHistory) {
        setCurrentMove(nextMoveIndex);
        return;
      }
      
      // Get current board state
      const currentBoard = getCurrentBoardState();
      
      // Check if the move is valid (including Ko rule)
      if (isValidMove(currentBoard, nextMove, boardHistory.slice(0, nextMoveIndex))) {
        setCurrentMove(nextMoveIndex);
      } else if (isKoSituation(currentBoard, nextMove, boardHistory.slice(0, nextMoveIndex))) {
        // Add informative comment if the move violates Ko
        console.info(`Move ${nextMoveIndex + 1} is a Ko situation`);
        
        // Set Ko position for visual indication
        if (nextMove.captures && nextMove.captures.length === 1) {
          setKoPosition({
            x: nextMove.captures[0].x,
            y: nextMove.captures[0].y
          });
          
          // Set Ko explanation
          setKoExplanation(
            "Ko rule: Player must play elsewhere before recapturing at this position."
          );
        }
        
        setCurrentMove(nextMoveIndex);
      } else {
        setCurrentMove(nextMoveIndex);
      }
    }
  };

  const handleFirstMove = () => {
    setAutoplayActive(false);
    setKoPosition(null);
    setKoExplanation(null);
    setCurrentMove(-1);
  };

  const handleLastMove = () => {
    setAutoplayActive(false);
    setKoPosition(null);
    setKoExplanation(null);
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

  const handleToggleHeatMap = () => {
    setShowHeatMap(!showHeatMap);
  };

  const handleToggleLibertyAnalysis = () => {
    setShowLibertyAnalysis(!showLibertyAnalysis);
  };

  const handleToggleWinRateChart = () => {
    setShowWinRateChart(!showWinRateChart);
  };

  const handleAnalysisTypeChange = (type: 'liberty' | 'influence') => {
    setAnalysisType(type);
  };

  const handleBoardThemeChange = (theme: BoardTheme) => {
    setBoardTheme(theme);
    localStorage.setItem('gosei-board-theme', theme);
  };

  const getCurrentMoveInfo = () => {
    if (!game || currentMove < 0) return null;
    return game.moves[currentMove];
  };

  const currentMoveInfo = getCurrentMoveInfo();

  const handleMoveChange = (newMoveIndex: number) => {
    setAutoplayActive(false);
    setKoPosition(null);
    setKoExplanation(null);
    setCurrentMove(newMoveIndex);
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

  // Get the current stones on the board based on the move history
  const getCurrentStones = () => {
    if (!game) return [];

    // Completely rebuild the board state based on the SGF data
    // This approach ensures all stones are correctly placed
    const size = game.info.size;
    
    // Create a 2D array to track the board state
    const boardState: Array<Array<Stone | null>> = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
    
    // Add handicap stones first
    const handicapStones = game.handicapStones || [];
    handicapStones.forEach(stone => {
      if (stone.x >= 0 && stone.x < size && stone.y >= 0 && stone.y < size) {
        boardState[stone.y][stone.x] = {
          x: stone.x,
          y: stone.y,
          color: 'black' // Handicap stones are always black
        };
      }
    });
    
    // Apply all moves up to the current move sequentially
    const movesToApply = game.moves.slice(0, currentMove + 1);
    
    console.log(`Applying ${movesToApply.length} moves to rebuild board state`);
    
    // Track the latest move for the current move indicator
    let latestMove: Stone | null = null;
    
    for (let i = 0; i < movesToApply.length; i++) {
      const move = movesToApply[i];
      
      // Skip pass moves
      if (move.x < 0 || move.y < 0) {
        continue;
      }
      
      // If this is the latest move, store it for the current move indicator
      if (i === movesToApply.length - 1) {
        latestMove = {
          x: move.x,
          y: move.y,
          color: move.color
        };
      }
      
      // Place the stone on the board
      if (move.x < size && move.y < size) {
        boardState[move.y][move.x] = {
          x: move.x,
          y: move.y,
          color: move.color
        };
        
        // Process captures
        if (move.captures && move.captures.length > 0) {
          move.captures.forEach(capturedPos => {
            if (capturedPos.x >= 0 && capturedPos.x < size && 
                capturedPos.y >= 0 && capturedPos.y < size) {
              // Remove the captured stone from the board
              boardState[capturedPos.y][capturedPos.x] = null;
            }
          });
        }
      }
    }
    
    // Convert the 2D board state to a flat list of stones
    const resultStones: Stone[] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (boardState[y][x] !== null) {
          resultStones.push(boardState[y][x]!);
        }
      }
    }
    
    console.log(`Final board has ${resultStones.length} stones`);
    
    // Ensure the latest move is added
    if (latestMove && currentMove >= 0) {
      // Check if the latestMove is already in the resultStones
      const hasLatestMove = resultStones.some(
        stone => stone.x === latestMove!.x && stone.y === latestMove!.y
      );
      
      if (!hasLatestMove) {
        console.warn(`Last move at ${latestMove.x},${latestMove.y} is missing - forcing add`);
        resultStones.push(latestMove);
      }
    }
    
    return resultStones;
  };

  // Create a move history array for the WinRateChart
  const moveHistory = useMemo(() => {
    if (!game) return [];
    
    const history: Stone[][] = [];
    
    // Start with handicap stones if any, ensuring they have the 'black' color property
    let currentStones: Stone[] = game.handicapStones ? 
      game.handicapStones.map(pos => ({ x: pos.x, y: pos.y, color: 'black' as const })) : 
      [];
    
    // Add initial position (just handicap stones if any)
    history.push([...currentStones]);
    
    // Add each move one by one
    game.moves.forEach(move => {
      if (move.x >= 0 && move.y >= 0) { // Skip pass moves
        // Copy current stones
        let updatedStones = [...currentStones];
        
        // First, remove any captured stones
        if (move.captures && move.captures.length > 0) {
          updatedStones = updatedStones.filter(stone => 
            !move.captures!.some(capture => 
              capture.x === stone.x && capture.y === stone.y
            )
          );
        }
        
        // Then add the new move stone
        updatedStones.push({
          x: move.x,
          y: move.y,
          color: move.color
        });
        
        // Update current stones
        currentStones = updatedStones;
        
        // Add to history
        history.push([...currentStones]);
      } else {
        // For pass moves, just duplicate the previous position
        history.push([...currentStones]);
      }
    });
    
    return history;
  }, [game]);

  const shortenPlayerName = (name: string, maxLength: number = 10) => {
    if (name.length > maxLength) {
      return name.slice(0, maxLength) + '...';
    }
    return name;
  };

  // Calculate current board state for Ko rule validation
  const getCurrentBoardState = (): ('black' | 'white' | null)[][] => {
    if (!game) return Array(19).fill(null).map(() => Array(19).fill(null));
    
    const size = game.info.size;
    const initialStones = game.handicapStones || [];
    const movesToApply = game.moves.slice(0, currentMove + 1).filter(m => m.x >= 0 && m.y >= 0);
    
    // Create initial board with handicap stones
    let board = createBoardFromStones(
      initialStones.map(stone => ({ ...stone, color: 'black' as const })), 
      size
    );
    
    // Apply each move in sequence
    for (const move of movesToApply) {
      const { newBoard } = applyMove(board, move);
      board = newBoard;
    }
    
    return board;
  };

  return (
    <div className={`kifu-reader ${isMobile ? 'kifu-reader-mobile' : ''}`}>
      {error && (
        <div className="error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      <div className="kifu-content">
        <div className="board-container">
          <GoBoard
            size={game?.info.size || 19}
            stones={getCurrentStones()}
            currentMove={currentMove}
            showMoveNumbers={showMoveNumbers}
            capturedStones={visibleCapturedStones}
            theme={boardTheme}
            showHeatMap={showHeatMap}
            koPosition={koPosition}
            game={game || undefined}
          />
          
          {/* Play controls positioned right after the board on mobile */}
          {isMobile && (
            <div className="navigation-container mobile-navigation">
              <div className="move-slider">
                <button className="move-button" onClick={handleFirstMove} title="First move">
                  ⏮️
                </button>
                <button className="move-button" onClick={handlePrevMove} title="Previous move">
                  ⏪
                </button>
                <button className="autoplay-button" onClick={toggleAutoplay}>
                  {autoplayActive ? '⏸️ Stop' : '▶️ Play'}
                </button>
                <button className="move-button" onClick={handleNextMove} title="Next move">
                  ⏩
                </button>
                <button className="move-button" onClick={handleLastMove} title="Last move">
                  ⏭️
                </button>
              </div>
              <input
                type="range"
                min="0"
                max={game?.moves.length || 0}
                value={currentMove}
                onChange={(e) => handleMoveChange(parseInt(e.target.value, 10))}
                className="move-range"
              />
              <div className="move-range-info">
                <span>Move: {currentMove + 1}</span>
                <span>Total: {game?.moves.length || 0}</span>
              </div>
            </div>
          )}
          
          {/* Add the LibertyAnalysis component */}
          {showLibertyAnalysis && (
            <LibertyAnalysis 
              stones={getCurrentStones()}
              boardSize={game?.info.size || 19}
            />
          )}
          
          {/* Add the WinRateChart component */}
          {showWinRateChart && moveHistory.length > 0 && game && (
            <WinRateChart 
              moveHistory={moveHistory}
              currentMove={currentMove}
              boardSize={game.info.size}
              analysisType={analysisType}
            />
          )}
        </div>
        <div className="controls-container">
          <div className="game-info">
            <div className="game-info-header">
              <div className="game-info-player">
                <div className="stone-icon black" aria-label="Black stone"></div>
                <div className="game-info-player-name">
                  <div className="player-name" title={game?.info.playerBlack || 'Unknown'}>
                    {game?.info.playerBlack ? shortenPlayerName(game.info.playerBlack, 20) : 'Unknown'}
                  </div>
                  <span className="game-info-player-captures">
                    Captures: {capturedWhite}
                  </span>
                </div>
              </div>
              <div className="game-info-player">
                <div className="stone-icon white" aria-label="White stone"></div>
                <div className="game-info-player-name">
                  <div className="player-name" title={game?.info.playerWhite || 'Unknown'}>
                    {game?.info.playerWhite ? shortenPlayerName(game.info.playerWhite, 20) : 'Unknown'}
                  </div>
                  <span className="game-info-player-captures">
                    Captures: {capturedBlack}
                  </span>
                </div>
              </div>
            </div>
            <div className="game-info-details">
              <span className="game-info-detail">Komi: {game?.info.komi || 6.5}</span>
              <span className="game-info-detail">Size: {game?.info.size || 19}×{game?.info.size || 19}</span>
              {game?.info.handicap && game.info.handicap > 1 && (
                <span className="game-info-detail">Handicap: {game.info.handicap}</span>
              )}
              {game?.info.result && (
                <span className="game-info-detail">Result: {game.info.result}</span>
              )}
              {koExplanation && (
                <div className="ko-explanation">
                  <span className="ko-alert">⚠️ Ko Detected</span>
                  <p>{koExplanation}</p>
                </div>
              )}
            </div>
            {currentMoveInfo?.comment && (
              <div className="game-info-comment">
                <div className="game-info-comment-title">Comment:</div>
                {currentMoveInfo.comment}
              </div>
            )}
          </div>
          
          {/* Only show navigation container in controls section on non-mobile */}
          {!isMobile && (
            <div className="navigation-container">
              <div className="move-slider">
                <button className="move-button" onClick={handleFirstMove} title="First move">
                  ⏮️
                </button>
                <button className="move-button" onClick={handlePrevMove} title="Previous move">
                  ⏪
                </button>
                <button className="autoplay-button" onClick={toggleAutoplay}>
                  {autoplayActive ? '⏸️ Stop' : '▶️ Play'}
                </button>
                <button className="move-button" onClick={handleNextMove} title="Next move">
                  ⏩
                </button>
                <button className="move-button" onClick={handleLastMove} title="Last move">
                  ⏭️
                </button>
              </div>
              <input
                type="range"
                min="0"
                max={game?.moves.length || 0}
                value={currentMove}
                onChange={(e) => handleMoveChange(parseInt(e.target.value, 10))}
                className="move-range"
              />
              <div className="move-range-info">
                <span>Move: {currentMove + 1}</span>
                <span>Total: {game?.moves.length || 0}</span>
              </div>
            </div>
          )}
          
          <KifuSettings
            showMoveNumbers={showMoveNumbers}
            enableSound={enableSound}
            showHeatMap={showHeatMap}
            showLibertyAnalysis={showLibertyAnalysis}
            showWinRateChart={showWinRateChart}
            analysisType={analysisType}
            onToggleMoveNumbers={handleToggleMoveNumbers}
            onToggleSound={handleToggleSound}
            onToggleHeatMap={handleToggleHeatMap}
            onToggleLibertyAnalysis={handleToggleLibertyAnalysis}
            onToggleWinRateChart={handleToggleWinRateChart}
            onAnalysisTypeChange={handleAnalysisTypeChange}
            boardTheme={boardTheme}
            onBoardThemeChange={handleBoardThemeChange}
            autoplaySpeed={autoplaySpeed}
            onAutoplaySpeedChange={handleAutoplaySpeedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default KifuReader; 