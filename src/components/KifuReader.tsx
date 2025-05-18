import React, { useState, useEffect, useRef, useMemo } from 'react';
import GoBoard, { BoardTheme } from './GoBoard';
import KifuSettings from './KifuSettings';
import LibertyAnalysis from './LibertyAnalysis';
import WinRateChart from './WinRateChart';
import { ParsedGame, parseSGF, movesToStones } from '../utils/sgfParser';
import { applyMove, createBoardFromStones, getHandicapPositions, findCapturedStones, Position, Stone, isValidMove, isKoSituation } from '../utils/goRules';
import { Move } from '../utils/sgfParser';
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
  userPlacementMode: boolean;
  onToggleUserPlacementMode: () => void;
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
  
  // Add test mode state
  const [testMode, setTestMode] = useState<boolean>(false);
  const [nextMoveColor, setNextMoveColor] = useState<'black' | 'white'>('black');
  const [testMoveNumber, setTestMoveNumber] = useState<number>(1);
  const [showTestMoveNumbers, setShowTestMoveNumbers] = useState<boolean>(true);
  
  // Add zen mode state
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  
  // Add user placement mode state
  const [userPlacementMode, setUserPlacementMode] = useState<boolean>(false);
  
  // Add engine settings panel state
  const [showEngineSettings, setShowEngineSettings] = useState<boolean>(false);
  
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

  // Add a reference to the original game state
  const [originalGame, setOriginalGame] = useState<ParsedGame | null>(null);
  const [originalCurrentMove, setOriginalCurrentMove] = useState<number>(-1);

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

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsZenMode(!isZenMode);
    // Close engine settings panel when exiting fullscreen
    if (isZenMode) {
      setShowEngineSettings(false);
    }
  };
  
  // Toggle engine settings panel
  const toggleEngineSettings = () => {
    setShowEngineSettings(!showEngineSettings);
  };
  
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
  }, [currentMove, capturedStones, game]);

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

  const handleNext20Moves = () => {
    setAutoplayActive(false);
    setKoPosition(null);
    setKoExplanation(null);
    if (game) {
      const newMoveIndex = Math.min(game.moves.length - 1, currentMove + 20);
      setCurrentMove(newMoveIndex);
    }
  };

  const handlePrev20Moves = () => {
    setAutoplayActive(false);
    setKoPosition(null);
    setKoExplanation(null);
    setCurrentMove(prev => Math.max(-1, prev - 20));
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

  // Get information about the current move
  const getCurrentMoveInfo = () => {
    if (!game || currentMove < 0 || currentMove >= game.moves.length) {
      return null;
    }
    
    const move = game.moves[currentMove];
    
    if (move.x < 0 || move.y < 0) {
      return "Pass";
    }
    
    // Convert coordinates to SGF letter format
    const xLetter = String.fromCharCode(97 + move.x); // 'a' = 97 in ASCII
    const yLetter = String.fromCharCode(97 + move.y);
    
    return `${move.color === 'black' ? 'Black' : 'White'} at ${xLetter}${yLetter}`;
  };

  // Get comments for the current move
  const getCurrentMoveComment = () => {
    if (!game || currentMove < 0 || currentMove >= game.moves.length) {
      return null;
    }
    
    const move = game.moves[currentMove];
    
    // Check if comment exists
    return move.comment || null;
  };

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

  // Save original game state when entering test mode
  useEffect(() => {
    if (game && !originalGame) {
      setOriginalGame(JSON.parse(JSON.stringify(game)));
      setOriginalCurrentMove(currentMove);
    }
  }, [game, originalGame, currentMove]);

  // Toggle user placement mode
  const toggleUserPlacementMode = () => {
    // Don't allow toggling if there's no game
    if (!game) return;
    
    // When enabling user placement mode
    if (!userPlacementMode) {
      // Disable autoplay
      if (autoplayActive) {
        setAutoplayActive(false);
      }
      
      // Save audio settings for stone sound and ensure it's enabled for placement
      if (!enableSound) {
        setEnableSound(true);
      }
    }
    
    setUserPlacementMode(prev => !prev);
  };

  // Handle toggle test mode
  const handleToggleTestMode = () => {
    const newTestMode = !testMode;
    setTestMode(newTestMode);
    
    // When enabling test mode, initialize next move color and save original game state
    if (newTestMode) {
      // Save original game state if not already saved
      if (!originalGame && game) {
        setOriginalGame(JSON.parse(JSON.stringify(game)));
        setOriginalCurrentMove(currentMove);
      }
      
      // Determine the next color based on current move
      if (game && game.moves.length > 0 && currentMove >= 0) {
        const lastMove = game.moves[currentMove];
        setNextMoveColor(lastMove.color === 'black' ? 'white' : 'black');
      } else {
        setNextMoveColor('black'); // Start with black if no moves yet
      }
      setTestMoveNumber(1);
      
      // Disable autoplay when entering test mode
      if (autoplayActive) {
        setAutoplayActive(false);
      }
    } else {
      // When disabling test mode, always restore to the original game to ensure continuation
      if (originalGame && game) {
        // Always restore to the original game state
        setGame(JSON.parse(JSON.stringify(originalGame)));
        
        // If in practice mode, set move to furthest practice move reached
        if (userPlacementMode) {
          // Find the furthest point in the original game sequence we've reached
          const furthestMove = Math.min(currentMove, originalGame.moves.length - 1);
          setCurrentMove(furthestMove);
        } else {
          // Just restore to where we were in the original game
          setCurrentMove(originalCurrentMove);
        }
        
        // Reset captured stones to match original game state
        setCapturedStones([...capturedStones.filter(stone => 
          stone.moveNumber <= originalCurrentMove + 1
        )]);
      }
    }
  };

  const handleBoardClick = (x: number, y: number) => {
    // Handle user placement mode (Practice Mode)
    if (userPlacementMode && game) {
      // Get next move to check if user clicked on the correct spot
      if (currentMove < game.moves.length - 1) {
        const nextMoveIndex = currentMove + 1;
        const nextMove = game.moves[nextMoveIndex];
        
        // Only proceed if the clicked position matches the next move 
        // and it's not a test move (we want to follow the original game sequence)
        if (nextMove.x === x && nextMove.y === y && !(nextMove as any).testMoveNumber) {
          setCurrentMove(nextMoveIndex);
          
          // Play sound if enabled
          if (enableSound) {
            playStoneSound();
          }
          
          // Update the capture count
          updateCaptureCount(nextMoveIndex);
          
          // If we're in Test Mode too, update the next color
          if (testMode) {
            setNextMoveColor(nextMove.color === 'black' ? 'white' : 'black');
          }
          
          return; // Exit early after handling practice mode move
        }
      }
      
      // If in Test Mode AND Practice Mode but the click doesn't match the next move,
      // treat it as a test move if the position is empty
      if (testMode) {
        // The click didn't match practice move. Continue below to handle it as a test move.
        console.log("Practice move not matched, handling as test move");
      } else {
        // Practice mode only, but click is not on the next move position
        return; // Ignore the click
      }
    }
    
    // Handle test mode - only proceed with test move if we're not handling a practice mode move
    if (testMode && game) {
      // Get current board state
      const currentBoard = getCurrentBoardState();
      
      // Check if the clicked position is empty
      if (currentBoard[y][x] !== null) {
        console.log("Position already occupied");
        return;
      }
      
      // Create new stone
      const newStone: Stone = {
        x,
        y,
        color: nextMoveColor
      };
      
      // Check if move is valid (no suicide, no ko)
      if (!isValidMove(currentBoard, newStone, boardHistory)) {
        console.log("Invalid move (suicide or ko)");
        return;
      }
      
      // Find captures
      const capturedPositions = findCapturedStones(currentBoard, newStone);
      const capturedColor = nextMoveColor === 'black' ? 'white' : 'black';
      
      // Add to captured stones count
      if (capturedColor === 'black') {
        setCapturedBlack(prev => prev + capturedPositions.length);
      } else {
        setCapturedWhite(prev => prev + capturedPositions.length);
      }
      
      // Add captured stones to the list with the current move number
      const moveNumber = currentMove + 2; // +1 because currentMove is 0-indexed, +1 more because this is a new move
      const newCapturedStones = [
        ...capturedStones,
        ...capturedPositions.map(pos => ({
          x: pos.x,
          y: pos.y,
          color: capturedColor as 'black' | 'white', // Ensure correct type
          moveNumber
        }))
      ];
      setCapturedStones(newCapturedStones);
      
      // Add the new stone to the game
      // Create a new move with required properties
      const newMove = {
        x,
        y,
        color: nextMoveColor,
        captures: capturedPositions,
        moveNumber: currentMove + 2, // Add the required moveNumber property
        coord: `${String.fromCharCode(97 + x)}${String.fromCharCode(97 + y)}`, // Add required coord property
        comments: [], // Add required comments property
        testMoveNumber // Add the test move number to identify test moves
      };
      
      // Add the new move to the game
      const updatedMoves = [...game.moves.slice(0, currentMove + 1), newMove];
      
      // Create a new game object
      const updatedGame: ParsedGame = {
        ...game,
        moves: updatedMoves
      };
      
      setGame(updatedGame);
      
      // Update current move index
      setCurrentMove(currentMove + 1);
      
      // Play sound
      if (enableSound) {
        playStoneSound();
      }
      
      // Save current board to history
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[y][x] = nextMoveColor;
      
      // Remove captured stones
      capturedPositions.forEach(pos => {
        newBoard[pos.y][pos.x] = null;
      });
      
      setBoardHistory(prev => [...prev, newBoard]);
      
      // Switch to next color
      setNextMoveColor(nextMoveColor === 'black' ? 'white' : 'black');
      
      // Increment test move number
      setTestMoveNumber(prev => prev + 1);
    }
  };

  // Handle toggle test move numbers
  const handleToggleTestMoveNumbers = () => {
    setShowTestMoveNumbers(prev => !prev);
  };

  // Add visual indication for Test Mode
  useEffect(() => {
    // When exiting Test Mode, make sure we restore the original game state
    if (!testMode && originalGame && game) {
      // Check if the game has been modified (more moves than the original)
      const currentGameHasExtraMoves = game.moves.length > originalGame.moves.length;
        
      if (currentGameHasExtraMoves) {
        console.log("Restoring original game state after exiting Test Mode");
        
        // Create a deep copy of the original game
        const restoredGame = JSON.parse(JSON.stringify(originalGame));
        
        // Always restore to the original game state to ensure user can continue with the original sequence
        setGame(restoredGame);
        
        // If we were in practice mode and had progressed past original game point,
        // we should keep that progress in the original game sequence
        if (userPlacementMode && currentMove > originalCurrentMove) {
          // Find how far along the original sequence we've progressed
          let lastOriginalMoveIndex = currentMove;
          // Go backwards until we find the last non-test move
          for (let i = currentMove; i > originalCurrentMove; i--) {
            if (i < game.moves.length && !(game.moves[i] as any).testMoveNumber) {
              lastOriginalMoveIndex = i;
              break;
            } else if (i === originalCurrentMove + 1) {
              // We found no non-test moves, so use the original current move
              lastOriginalMoveIndex = originalCurrentMove;
            }
          }
          
          // Restore to the furthest we got in the original sequence
          setCurrentMove(Math.min(lastOriginalMoveIndex, originalGame.moves.length - 1));
        } else {
          // If we weren't in practice mode, restore to original position
          setCurrentMove(originalCurrentMove);
        }
        
        // Reset captured stones to match original game state
        setCapturedStones(prevStones => 
          prevStones.filter(stone => 
            stone.moveNumber <= originalCurrentMove + 1 ||
            (userPlacementMode && stone.moveNumber <= currentMove + 1 && 
             !game.moves.some(m => 
               (m as any).testMoveNumber && 
               m.captures && 
               m.captures.some(c => c.x === stone.x && c.y === stone.y)
             ))
          )
        );
      }
    }
  }, [testMode, originalGame, originalCurrentMove, game, userPlacementMode, currentMove]);

  return (
    <div className={`kifu-reader ${isMobile ? 'kifu-reader-mobile' : ''} ${isZenMode ? 'kifu-fullscreen' : ''}`}>
      {error && (
        <div className="error">
          <span>⚠️</span>
          {error}
        </div>
      )}
      <div className="kifu-content">
        <div className="board-container">
          {/* Fullscreen toggle button for mobile */}
          {isMobile && (
            <div className="fullscreen-controls">
              <button
                className="fullscreen-toggle"
                onClick={toggleFullscreen}
                aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
              >
                {isZenMode ? "Exit Zen Mode" : "Zen Mode"}
              </button>
              
              {/* Engine settings button (only in fullscreen mode) */}
              {isZenMode && (
                <button
                  className="engine-settings-button"
                  onClick={toggleEngineSettings}
                  aria-label="Engine settings"
                >
                  ⚙️ Settings
                </button>
              )}
              
              {/* Mode buttons in Zen mode */}
              {isZenMode && (
                <>
                  <button
                    className={`fullscreen-mode-button ${userPlacementMode ? 'active' : ''}`}
                    onClick={toggleUserPlacementMode}
                    disabled={!game}
                    title="Practice Mode: Learn by following along with the game sequence - click on the green highlighted spot to place the next move."
                  >
                    {userPlacementMode ? "Exit Practice Mode" : "Practice Mode"}
                  </button>
                  
                  <button
                    className={`fullscreen-mode-button ${testMode ? 'active' : ''}`}
                    onClick={handleToggleTestMode}
                    disabled={!game}
                    title="Test Mode: Create and try your own variations - you can freely place alternating black and white stones."
                  >
                    {testMode ? "Exit Test Mode" : "Test Mode"}
                  </button>
                </>
              )}
            </div>
          )}
          
          {/* Engine settings panel */}
          {isZenMode && showEngineSettings && (
            <div className="engine-settings-panel">
              <div className="engine-settings-header">
                <h3>Game Settings</h3>
                <button 
                  className="close-settings"
                  onClick={toggleEngineSettings}
                  aria-label="Close settings"
                >
                  ×
                </button>
              </div>
              <div className="engine-settings-content">
                <div className="settings-group">
                  {/* Practice and Test Mode buttons - removed */}
                  
                  <label className="settings-label">
                    <input
                      type="checkbox"
                      checked={showMoveNumbers}
                      onChange={handleToggleMoveNumbers}
                    />
                    Show Move Numbers
                  </label>
                  
                  <label className="settings-label">
                    <input
                      type="checkbox"
                      checked={enableSound}
                      onChange={handleToggleSound}
                    />
                    Stone Sound
                  </label>
                  
                  <label className="settings-label">
                    <input
                      type="checkbox"
                      checked={showHeatMap}
                      onChange={handleToggleHeatMap}
                    />
                    Show Heat Map
                  </label>
                </div>
                
                <div className="settings-group">
                  <div className="settings-label">Board Theme</div>
                  <div className="theme-selector">
                    <button 
                      className={`theme-option ${boardTheme === 'default' ? 'active' : ''}`}
                      onClick={() => handleBoardThemeChange('default')}
                    >
                      Default
                    </button>
                    <button 
                      className={`theme-option ${boardTheme === 'light-wood-3d' ? 'active' : ''}`}
                      onClick={() => handleBoardThemeChange('light-wood-3d')}
                    >
                      Light Wood
                    </button>
                    <button 
                      className={`theme-option ${boardTheme === 'dark-wood-3d' ? 'active' : ''}`}
                      onClick={() => handleBoardThemeChange('dark-wood-3d')}
                    >
                      Dark Wood
                    </button>
                    <button 
                      className={`theme-option ${boardTheme === 'universe' ? 'active' : ''}`}
                      onClick={() => handleBoardThemeChange('universe')}
                    >
                      Universe
                    </button>
                  </div>
                </div>
                
                <div className="settings-group">
                  <div className="settings-label">Autoplay Speed</div>
                  <input
                    type="range"
                    min="500"
                    max="2500"
                    value={3000 - autoplaySpeed}
                    onChange={handleAutoplaySpeedChange}
                    className="settings-slider"
                  />
                  <div className="slider-labels">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="board-wrapper">
            <GoBoard
              size={game ? game.info.size : 19}
              stones={getCurrentStones()}
              currentMove={currentMove}
              showMoveNumbers={showMoveNumbers}
              capturedStones={capturedStones}
              onClick={handleBoardClick}
              theme={boardTheme}
              showHeatMap={showHeatMap}
              koPosition={koPosition}
              testMode={testMode}
              showTestMoveNumbers={showTestMoveNumbers}
              game={game || undefined}
              highlightNextMove={userPlacementMode}
            />
            
            {/* Mode indicators when both are active */}
            {testMode && userPlacementMode && !isZenMode && (
              <div className="dual-mode-indicator">
                <div className="dual-mode-text">
                  <span className="practice-mode-text">Practice Mode</span> +
                  <span className="test-mode-text">Test Mode</span>
                </div>
                <div className="dual-mode-hint">
                  Follow the game or create variations!
                </div>
              </div>
            )}
            
            {/* Mode toggle buttons - display only for non-mobile or when not in Zen mode */}
            {(!isMobile || !isZenMode) && (
              <div className="buttons-row mode-buttons">
                <button
                  className={`mode-button ${userPlacementMode ? 'active' : ''}`}
                  onClick={toggleUserPlacementMode}
                  disabled={!game}
                  title="Practice Mode: Learn by following along with the game sequence - click on the green highlighted spot to place the next move. Can be used with Test Mode."
                >
                  {userPlacementMode ? "Exit Practice Mode" : "Practice Mode"}
                </button>
                
                <button
                  className={`mode-button ${testMode ? 'active' : ''}`}
                  onClick={handleToggleTestMode}
                  disabled={!game}
                  title="Test Mode: Create and try your own variations - you can freely place alternating black and white stones. Can be used with Practice Mode."
                >
                  {testMode ? "Exit Test Mode" : "Test Mode"}
                </button>
              </div>
            )}
          </div>
          
          {/* Play controls positioned right after the board on mobile */}
          {isMobile && (
            <div className="navigation-container mobile-navigation">
              <div className="move-slider">
                <button className="move-button" onClick={handlePrev20Moves} title="Previous 20 moves">
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
                <button className="move-button" onClick={handleNext20Moves} title="Next 20 moves">
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
              onAnalysisTypeChange={handleAnalysisTypeChange}
            />
          )}
        </div>
        <div className={`controls-container ${isZenMode ? 'hidden-on-fullscreen' : ''}`}>
          <div className="game-info">
            <div className="game-info-header">
              <div className="game-info-player">
                <div className="stone-icon black" aria-label="Black stone"></div>
                <div className="game-info-player-name">
                  <div className="player-name" title={game?.info.playerBlack || 'Unknown'}>
                    {game?.info.playerBlack ? shortenPlayerName(game.info.playerBlack, 20) : 'Unknown'}
                    {game?.info.handicap && game.info.handicap > 1 && ` (H${game.info.handicap})`}
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
            
            {/* Comment Section (Fixed) */}
            {getCurrentMoveComment() && (
              <div className="game-info-comment">
                <div className="game-info-comment-title">Comment:</div>
                {getCurrentMoveComment()}
              </div>
            )}
            
            {/* Game Metadata Section (Fixed) */}
            {game && (
              <div className="game-metadata">
                {game.info.date && <div>Date: {game.info.date}</div>}
                {game.info.result && <div>Result: {game.info.result}</div>}
                {game.info.komi && <div>Komi: {game.info.komi}</div>}
                {'rules' in game.info && 'rules' in game.info && game.info.rules ? 
                  <div>Rules: {String(game.info.rules)}</div> : null}
              </div>
            )}
            
            {/* Current Move Info */}
            {getCurrentMoveInfo() && (
              <div className="current-move-info">
                Move {currentMove + 1}: {getCurrentMoveInfo()}
              </div>
            )}
          </div>
          
          {/* Only show navigation container in controls section on non-mobile */}
          {!isMobile && (
            <div className="navigation-container">
              <div className="move-slider">
                <button className="move-button" onClick={handlePrev20Moves} title="Previous 20 moves">
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
                <button className="move-button" onClick={handleNext20Moves} title="Next 20 moves">
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
            userPlacementMode={userPlacementMode}
            onToggleUserPlacementMode={toggleUserPlacementMode}
          />
        </div>
      </div>
    </div>
  );
};

export default KifuReader;