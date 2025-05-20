import React, { useMemo, useCallback, useState, useEffect } from 'react';
import './GoBoard.css';
import { generateHeatMap } from '../utils/boardAnalysis';

export type BoardTheme = 'default' | 'dark-wood-3d' | 'light-wood-3d' | 'universe';

interface Stone {
  x: number;
  y: number;
  color: 'black' | 'white';
}

interface CapturedStone {
  x: number;
  y: number;
  color: 'black' | 'white';
  moveNumber: number;
}

interface GoBoardProps {
  size: number;
  stones: Stone[];
  currentMove?: number;
  showMoveNumbers?: boolean;
  capturedStones?: CapturedStone[];
  onClick?: (x: number, y: number) => void;
  theme?: BoardTheme;
  showHeatMap?: boolean;
  koPosition?: { x: number, y: number } | null;
  testMode?: boolean;
  showTestMoveNumbers?: boolean;
  game?: { 
    moves: Array<{ 
      x: number; 
      y: number; 
      color?: 'black' | 'white';
      testMoveNumber?: number; 
    }>;
    handicapStones?: Array<{ x: number; y: number }>;
  };
  highlightNextMove?: boolean;
}

// Theme configurations for different board styles
const BOARD_THEMES = {
  'default': {
    boardColor: '#e6c588',
    lineColor: '#333',
    hoshiColor: '#333',
    borderWidth: 2,
    stoneEffects: {
      black: 'brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
      white: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
    },
    coordsColor: '#333',
    stoneGradient: false,
    woodTexture: null
  },
  'dark-wood-3d': {
    boardColor: '#6b4423',
    lineColor: '#222',
    hoshiColor: '#222',
    borderWidth: 2,
    stoneEffects: {
      black: 'brightness(1.1) drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
      white: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
    },
    coordsColor: '#ddd',
    stoneGradient: true,
    woodTexture: 'darkwood' as const
  },
  'light-wood-3d': {
    boardColor: '#d9b383',
    lineColor: '#333',
    hoshiColor: '#333',
    borderWidth: 2,
    stoneEffects: {
      black: 'brightness(1.1) drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
      white: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
    },
    coordsColor: '#333',
    stoneGradient: true,
    woodTexture: 'lightwood' as const
  },
  'universe': {
    boardColor: '#1a1a2e',
    lineColor: '#4d4d8f',
    hoshiColor: '#7f7fc4',
    borderWidth: 2,
    stoneEffects: {
      black: 'brightness(0.8) drop-shadow(0 0 5px rgba(0,0,0,0.8))',
      white: 'brightness(1.2) drop-shadow(0 0 8px rgba(255,255,255,0.5))'
    },
    coordsColor: '#7f7fc4',
    stoneGradient: false,
    woodTexture: null
  }
};

// Define wood texture types
type WoodTexture = 'lightwood' | 'darkwood';

// Wood texture patterns
const WOOD_TEXTURES: Record<WoodTexture, string> = {
  lightwood: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise' x='0%25' y='0%25' width='100%25' height='100%25'%3E%3CfeTurbulence baseFrequency='0.02 0.05' seed='2' type='fractalNoise' numOctaves='3' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='%23d9b383'/%3E%3C/svg%3E")`,
  darkwood: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise' x='0%25' y='0%25' width='100%25' height='100%25'%3E%3CfeTurbulence baseFrequency='0.02 0.05' seed='2' type='fractalNoise' numOctaves='3' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='5' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' fill='%236b4423'/%3E%3C/svg%3E")`
};

const GoBoard: React.FC<GoBoardProps> = ({ 
  size = 19, 
  stones = [], 
  currentMove = -1, 
  showMoveNumbers = false,
  capturedStones = [],
  onClick,
  theme = 'default',
  showHeatMap = false,
  koPosition = null,
  testMode = false,
  showTestMoveNumbers = true,
  game,
  highlightNextMove = false
}) => {
  // Make cellSize responsive based on screen width
  const [cellSize, setCellSize] = useState(32);
  
  // Get the theme configuration
  const themeConfig = BOARD_THEMES[theme] || BOARD_THEMES.default;
  
  // Calculate positions for star points (hoshi)
  const getHoshiPoints = useCallback((boardSize: number) => {
    if (size === 21) return [3, 10, 17];
    if (size === 19) return [3, 9, 15];
    if (size === 15) return [3, 7, 11];
    if (size === 13) return [3, 6, 9];
    if (size === 9) return [2, 4, 6];
    return [];
  }, [size]);
  
  const hoshiPoints = useMemo(() => getHoshiPoints(size), [getHoshiPoints, size]);
  
  // Add effect to adjust cell size based on screen width and board size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Use the smaller dimension to ensure square sizing
      const minDimension = Math.min(width, height);
      
      // Base cell size on screen dimensions
      let baseCellSize;
      if (minDimension <= 360) {
        baseCellSize = 13; // Very small screens
      } else if (minDimension <= 480) {
        baseCellSize = 15; // Small mobile
      } else if (minDimension <= 768) {
        baseCellSize = 20; // Tablets
      } else if (minDimension <= 1024) {
        baseCellSize = 32; // Small laptops
      } else if (minDimension <= 1366) {
        baseCellSize = 36; // Medium laptops
      } else {
        baseCellSize = 40; // Large screens
      }
      
      // Adjust cell size based on board size to make smaller boards appear larger
      let adjustedCellSize = baseCellSize;
      if (size === 9) {
        adjustedCellSize = baseCellSize * 1.6; // 60% larger for 9x9
      } else if (size === 13) {
        adjustedCellSize = baseCellSize * 1.3; // 30% larger for 13x13
      } else if (size === 15) {
        adjustedCellSize = baseCellSize * 1.2; // 20% larger for 15x15
      } else if (size === 21) {
        adjustedCellSize = baseCellSize * 0.9; // 10% smaller for 21x21
      }
      
      setCellSize(adjustedCellSize);
    };
    
    // Initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);
  
  const boardSize = (size - 1) * cellSize;
  const boardPadding = cellSize / 2;
  
  const handleCellClick = useCallback((x: number, y: number) => {
    if (onClick) onClick(x, y);
  }, [onClick]);
  
  // Create a map of captured stones for easier lookup
  const capturedStonesMap = useMemo(() => {
    const map = new Map<string, CapturedStone>();
    if (capturedStones && capturedStones.length > 0) {
      capturedStones.forEach(stone => {
        map.set(`${stone.x},${stone.y}`, stone);
      });
    }
    return map;
  }, [capturedStones]);
  
  // Determine if a stone at given coordinates is visible
  const isStoneVisible = useCallback((x: number, y: number): boolean => {
    const key = `${x},${y}`;
    
    // Check if the coordinates match a captured stone for the current move number
    const currentMoveNumber = currentMove >= 0 ? currentMove + 1 : 0;
    const capturedStone = capturedStonesMap.get(key);
    
    if (capturedStone && capturedStone.moveNumber <= currentMoveNumber) {
      console.log(`Stone at ${x},${y} was captured in move ${capturedStone.moveNumber}, current move: ${currentMoveNumber}`);
      return false; // Stone is captured and should not be visible
    }
    
    return true; // Stone is visible
  }, [capturedStonesMap, currentMove]);
  
  // Generate heat map data when stones change or when toggled
  const heatMapData = useMemo(() => {
    if (!showHeatMap) return null;
    return generateHeatMap(stones.slice(0, currentMove >= 0 ? currentMove + 1 : stones.length), size);
  }, [showHeatMap, stones, currentMove, size]);
  
  // Find the latest stone for current move marker
  const latestStone = useMemo(() => {
    if (stones.length === 0 || currentMove < 0) return null;
    
    // For improved user experience, directly find the stone that corresponds to the current move
    if (currentMove >= 0) {
      // Get the current move from the stones array
      const currentMoveStone = game?.moves[currentMove];
      
      // If the current move is a valid stone placement (not a pass move)
      if (currentMoveStone && currentMoveStone.x >= 0 && currentMoveStone.y >= 0) {
        // Find the corresponding stone in our stones array
        return stones.find(stone => 
          stone.x === currentMoveStone.x && 
          stone.y === currentMoveStone.y
        );
      }
    }
    
    return null;
  }, [stones, currentMove, game?.moves]);
  
  // Create a map of stones for easier lookup
  const stonesMap = useMemo(() => {
    const map = new Map<string, Stone>();
    stones.forEach(stone => {
      map.set(`${stone.x},${stone.y}`, stone);
    });
    return map;
  }, [stones]);

  // Find the next move to highlight (if enabled)
  const nextMove = useMemo(() => {
    if (!game || !highlightNextMove || currentMove >= game.moves.length - 1) {
      return null;
    }
    
    // Get the next move after current move
    const next = game.moves[currentMove + 1];
    
    // Check if this is a test move - if so, don't highlight it in practice mode
    // unless we're explicitly in test mode
    if (next?.testMoveNumber && !testMode) {
      return null;
    }
    
    if (!next || next.x < 0 || next.y < 0) {
      return null; // Invalid move or pass
    }
    
    return {
      x: next.x,
      y: next.y,
      color: next.color || (currentMove % 2 === 0 ? 'white' : 'black') // Fallback logic
    };
  }, [game, currentMove, highlightNextMove, testMode]);
  
  const renderStones = useCallback(() => {
    const visibleStones = stones;
    
    // Log all stones for debugging
    console.log("Rendering stones:", visibleStones.map(s => `${s.color} at ${s.x},${s.y}`), "total:", visibleStones.length);
    console.log("Latest stone (current move):", latestStone);
    
    // Create a map to ensure we only render each position once
    // In case of overlapping positions, prioritize the last stone in the array (latest move)
    const stonesByPosition = new Map<string, Stone>();
    
    // Process stones in order, so later stones (latest moves) overwrite earlier ones
    visibleStones.forEach(stone => {
      const posKey = `${stone.x},${stone.y}`;
      stonesByPosition.set(posKey, stone);
    });
    
    // Create an array from the map values to render
    const stonesToRender = Array.from(stonesByPosition.values());
    console.log("Stones to render after deduplication:", stonesToRender.length);
    
    // Render stones
    return stonesToRender.map((stone) => {
      // Adjust stone size for better visibility on small screens
      const stoneRadius = cellSize <= 15 ? cellSize * 0.48 : cellSize * 0.45;
      
      // Check if this is the latest move
      const isLatestMove = latestStone && stone.x === latestStone.x && stone.y === latestStone.y;
      
      if (isLatestMove) {
        console.log("Rendering latest move indicator on:", stone);
      }
      
      // Find move number for this stone
      let moveNumber = -1;
      let testMoveNumber = -1;
      if (game && game.moves) {
        // Find the move index in game history
        const moveIndex = game.moves.findIndex(move => 
          move.x === stone.x && 
          move.y === stone.y &&
          (!move.color || move.color === stone.color)
        );
        
        if (moveIndex !== -1) {
          moveNumber = moveIndex;
          // Check if this move has a test move number
          if (game.moves[moveIndex].testMoveNumber !== undefined) {
            testMoveNumber = game.moves[moveIndex].testMoveNumber!;
          }
        }
        
        // Check if this is a handicap stone (black stones placed at the beginning)
        const isHandicapStone = 
          moveNumber === -1 && 
          stone.color === 'black' && 
          game.handicapStones !== undefined && 
          game.handicapStones.some((hs: {x: number, y: number}) => hs.x === stone.x && hs.y === stone.y);
          
        // Don't display move numbers for handicap stones
        if (isHandicapStone) {
          moveNumber = -1;
        }
      }
      
      return (
        <g key={`${stone.x}-${stone.y}`} className="stone">
          {/* Stone shadow */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize + 1.5}
            r={stoneRadius}
            fill="rgba(0,0,0,0.15)"
            style={{ filter: 'blur(1px)' }}
          />
          
          {/* Add 3D gradient effect for 3D themes */}
          {themeConfig.stoneGradient && (
            <defs>
              <radialGradient id={`stoneGradient-${stone.color}-${stone.x}-${stone.y}`} 
                              cx="0.4" cy="0.4" r="0.7" fx="0.4" fy="0.4">
                {stone.color === 'black' ? (
                  <>
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="70%" stopColor="#222" />
                    <stop offset="100%" stopColor="#000" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="70%" stopColor="#f3f3f3" />
                    <stop offset="100%" stopColor="#ddd" />
                  </>
                )}
              </radialGradient>
            </defs>
          )}
          
          {/* Actual stone */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize}
            r={stoneRadius}
            fill={themeConfig.stoneGradient ? 
              `url(#stoneGradient-${stone.color}-${stone.x}-${stone.y})` : 
              stone.color}
            stroke={stone.color === 'black' ? '#222' : '#888'} // Improved contrast for white stones
            strokeWidth={0.8} // Slightly thicker border
            style={{ 
              filter: stone.color === 'black' 
                ? themeConfig.stoneEffects.black
                : themeConfig.stoneEffects.white
            }}
          />
          
          {/* Add stone highlight for 3D effect */}
          {themeConfig.stoneGradient && (
            <circle
              cx={stone.x * cellSize - stoneRadius * 0.2}
              cy={stone.y * cellSize - stoneRadius * 0.2}
              r={stoneRadius * 0.4}
              fill={stone.color === 'black' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)'}
              style={{ filter: 'blur(1px)' }}
            />
          )}
          
          {/* Latest move marker (only show if not showing move numbers) */}
          {isLatestMove && !showMoveNumbers && !testMode && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.18} // Larger indicator
              fill={stone.color === 'black' ? 'white' : 'black'}
              opacity={0.8}
              className="latest-move-indicator"
            />
          )}
          
          {/* Move number */}
          {showMoveNumbers && moveNumber >= 0 && (
            <text
              x={stone.x * cellSize}
              y={stone.y * cellSize}
              textAnchor="middle"
              dominantBaseline="central"
              fill={stone.color === 'black' ? 'white' : 'black'}
              fontSize={cellSize <= 15 ? cellSize * 0.4 : cellSize * 0.35}
              fontWeight="bold"
              style={{
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {moveNumber + 1}
            </text>
          )}
          
          {/* Test Mode Numbers */}
          {testMode && showTestMoveNumbers && testMoveNumber > 0 && (
            <text
              x={stone.x * cellSize}
              y={stone.y * cellSize}
              textAnchor="middle"
              dominantBaseline="central"
              fill={stone.color === 'black' ? 'white' : 'black'}
              fontSize={cellSize <= 15 ? cellSize * 0.4 : cellSize * 0.35}
              fontWeight="bold"
              style={{
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {testMoveNumber}
            </text>
          )}
        </g>
      );
    });
  }, [stones, showMoveNumbers, cellSize, themeConfig, latestStone, currentMove, game, showTestMoveNumbers]);
  
  // Render any captured stones with a special style
  const renderCapturedStones = useCallback(() => {
    if (!capturedStones || capturedStones.length === 0) return null;
    
    // Only show captures up to the current move
    const visibleCaptures = capturedStones.filter(
      stone => stone.moveNumber <= (currentMove >= 0 ? currentMove + 1 : stones.length)
    );
    
    // Create an animation effect for recent captures (stones captured in the last move)
    const lastMoveNumber = currentMove >= 0 ? currentMove + 1 : stones.length;
    
    return visibleCaptures.map((stone, index) => {
      const isRecentCapture = stone.moveNumber === lastMoveNumber;
      
      return (
        <g key={`captured-${stone.x}-${stone.y}-${index}`} className="captured-stone">
          {/* Show a more visible "X" mark where the stone was captured */}
          <line
            x1={(stone.x * cellSize) - (cellSize * 0.3)}
            y1={(stone.y * cellSize) - (cellSize * 0.3)}
            x2={(stone.x * cellSize) + (cellSize * 0.3)}
            y2={(stone.y * cellSize) + (cellSize * 0.3)}
            stroke={stone.color === 'black' ? '#333' : '#888'} // Better contrast
            strokeWidth={1.5} // Thicker line for better visibility
            opacity={0.6} // Higher opacity for better visibility
            strokeDasharray={isRecentCapture ? "0" : "3,2"}
          />
          <line
            x1={(stone.x * cellSize) + (cellSize * 0.3)}
            y1={(stone.y * cellSize) - (cellSize * 0.3)}
            x2={(stone.x * cellSize) - (cellSize * 0.3)}
            y2={(stone.y * cellSize) + (cellSize * 0.3)}
            stroke={stone.color === 'black' ? '#333' : '#888'} // Better contrast
            strokeWidth={1.5} // Thicker line for better visibility
            opacity={0.6} // Higher opacity for better visibility
            strokeDasharray={isRecentCapture ? "0" : "3,2"}
          />
          
          {/* Add a more visible ghost of the stone for recent captures */}
          {isRecentCapture && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.25} // Larger ghost
              fill={stone.color}
              opacity={0.15} // Slightly more visible
            />
          )}
        </g>
      );
    });
  }, [capturedStones, currentMove, stones.length, cellSize]);
  
  const renderGrid = useCallback(() => {
    const lines = [];
    
    // Horizontal lines
    for (let i = 0; i < size; i++) {
      lines.push(
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * cellSize}
          x2={boardSize}
          y2={i * cellSize}
          stroke={themeConfig.lineColor}
          strokeWidth={i === 0 || i === size - 1 ? themeConfig.borderWidth : 1}
        />
      );
    }
    
    // Vertical lines
    for (let i = 0; i < size; i++) {
      lines.push(
        <line
          key={`v-${i}`}
          x1={i * cellSize}
          y1={0}
          x2={i * cellSize}
          y2={boardSize}
          stroke={themeConfig.lineColor}
          strokeWidth={i === 0 || i === size - 1 ? themeConfig.borderWidth : 1}
        />
      );
    }
    
    return lines;
  }, [size, cellSize, boardSize, themeConfig]);
  
  const renderCoordinates = useCallback(() => {
    const coords = [];
    const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // Skip 'I'
    
    // Column coordinates at the top (letters)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`col-top-${i}`}
          x={i * cellSize}
          y={-boardPadding / 2}
          textAnchor="middle"
          fill={themeConfig.coordsColor}
          fillOpacity="0.7"
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {letters[i]}
        </text>
      );
    }
    
    // Column coordinates at the bottom (letters)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`col-bottom-${i}`}
          x={i * cellSize}
          y={boardSize + boardPadding}
          textAnchor="middle"
          fill={themeConfig.coordsColor}
          fillOpacity="0.7"
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {letters[i]}
        </text>
      );
    }
    
    // Row coordinates on the left (numbers)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`row-left-${i}`}
          x={-boardPadding}
          y={i * cellSize + cellSize * 0.15}
          textAnchor="middle"
          fill={themeConfig.coordsColor}
          fillOpacity="0.7"
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {size - i}
        </text>
      );
    }
    
    // Row coordinates on the right (numbers)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`row-right-${i}`}
          x={boardSize + boardPadding}
          y={i * cellSize + cellSize * 0.15}
          textAnchor="middle"
          fill={themeConfig.coordsColor}
          fillOpacity="0.7"
          fontSize={cellSize * 0.45} // Larger font for coordinates
          fontWeight="500" // Slightly bolder
          fontFamily="sans-serif"
        >
          {size - i}
        </text>
      );
    }
    
    return coords;
  }, [size, cellSize, boardSize, boardPadding, themeConfig]);
  
  const renderHoshiPoints = useCallback(() => {
    const points = [];
    
    for (const x of hoshiPoints) {
      for (const y of hoshiPoints) {
        points.push(
          <circle
            key={`hoshi-${x}-${y}`}
            cx={x * cellSize}
            cy={y * cellSize}
            r={Math.max(3, cellSize * 0.12)} // Responsive star point size
            fill={themeConfig.hoshiColor}
          />
        );
      }
    }
    
    return points;
  }, [hoshiPoints, cellSize, themeConfig]);
  
  const renderCellOverlays = useCallback(() => {
    if (!onClick) return null;
    
    const overlays = [];
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        // Skip if there's already a stone at this position
        const hasStone = stones.some(stone => 
          stone.x === x && stone.y === y &&
          isStoneVisible(stone.x, stone.y)
        );
        
        if (!hasStone) {
          overlays.push(
            <rect
              key={`overlay-${x}-${y}`}
              className="stone-overlay"
              x={(x * cellSize) - (cellSize / 2)}
              y={(y * cellSize) - (cellSize / 2)}
              width={cellSize}
              height={cellSize}
              fill="transparent"
              onClick={() => handleCellClick(x, y)}
              style={{ cursor: 'pointer' }}
            />
          );
        }
      }
    }
    
    return overlays;
  }, [size, cellSize, stones, isStoneVisible, onClick, handleCellClick, testMode]);
  
  // Render heat map overlay
  const renderHeatMap = useCallback(() => {
    if (!showHeatMap || !heatMapData) return null;
    
    const { blackInfluence, whiteInfluence } = heatMapData;
    const heatMapCells = [];
    
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Skip positions with stones
        const hasStone = stones.some(
          stone => stone.x === x && stone.y === y && isStoneVisible(stone.x, stone.y)
        );
        
        if (hasStone) continue;
        
        const blackValue = blackInfluence[y][x];
        const whiteValue = whiteInfluence[y][x];
        
        if (blackValue > 0 || whiteValue > 0) {
          let color;
          let opacity;
          
          // Determine if this is a black or white dominated area
          if (blackValue > whiteValue) {
            // Black influence - more intense red for stronger influence
            color = 'rgb(255, 0, 0)';
            opacity = Math.min(0.7, blackValue * 0.8);
          } else if (whiteValue > blackValue) {
            // White influence - more intense blue for stronger influence
            color = 'rgb(0, 100, 255)';
            opacity = Math.min(0.7, whiteValue * 0.8);
          } else {
            // Equal influence - show as purple
            color = 'rgb(128, 0, 128)';
            opacity = Math.min(0.5, (blackValue + whiteValue) * 0.4);
          }
          
          heatMapCells.push(
            <rect
              key={`heat-${x}-${y}`}
              x={(x * cellSize) - (cellSize / 2)}
              y={(y * cellSize) - (cellSize / 2)}
              width={cellSize}
              height={cellSize}
              fill={color}
              opacity={opacity}
              rx={2}
              ry={2}
            />
          );
        }
      }
    }
    
    return heatMapCells;
  }, [showHeatMap, heatMapData, size, cellSize, stones, isStoneVisible]);
  
  // Render a Ko position indicator
  const renderKoIndicator = useCallback(() => {
    if (!koPosition) return null;
    
    return (
      <g className="ko-indicator">
        <circle
          cx={koPosition.x * cellSize}
          cy={koPosition.y * cellSize}
          r={cellSize * 0.3}
          fill="transparent"
          stroke="#ff4500"
          strokeWidth={2}
          strokeDasharray="4,2"
          opacity={0.8}
        />
        <text
          x={koPosition.x * cellSize}
          y={koPosition.y * cellSize - cellSize * 0.5}
          textAnchor="middle"
          fill="#ff4500"
          fontSize={cellSize * 0.4}
          fontWeight="bold"
          opacity={0.9}
        >
          Ko
        </text>
      </g>
    );
  }, [koPosition, cellSize]);
  
  // DEBUG: Add a function to check and visualize stones with no liberties
  const checkStonesWithNoLiberties = useCallback(() => {
    // Create a board representation from the stones
    const board = Array(size).fill(null).map(() => Array(size).fill(null));
    stones.forEach(stone => {
      board[stone.y][stone.x] = stone.color;
    });
    
    // Find stones with no liberties
    const noLibertyStones: {x: number, y: number}[] = [];
    
    stones.forEach(stone => {
      // Find the group this stone belongs to
      const group: {x: number, y: number}[] = [];
      const visited = Array(size).fill(false).map(() => Array(size).fill(false));
      const queue = [{x: stone.x, y: stone.y}];
      
      while (queue.length > 0) {
        const pos = queue.shift()!;
        if (visited[pos.y][pos.x]) continue;
        
        visited[pos.y][pos.x] = true;
        group.push(pos);
        
        // Check adjacent positions
        const directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
        directions.forEach(dir => {
          const newX = pos.x + dir.x;
          const newY = pos.y + dir.y;
          
          // Skip if out of bounds
          if (newX < 0 || newX >= size || newY < 0 || newY >= size) return;
          
          // Add to queue if same color and not visited
          if (!visited[newY][newX] && board[newY][newX] === stone.color) {
            queue.push({x: newX, y: newY});
          }
        });
      }
      
      // Count liberties for this group
      let hasLiberties = false;
      for (const pos of group) {
        const directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
        for (const dir of directions) {
          const newX = pos.x + dir.x;
          const newY = pos.y + dir.y;
          
          // Skip if out of bounds
          if (newX < 0 || newX >= size || newY < 0 || newY >= size) continue;
          
          // If empty space, group has liberty
          if (board[newY][newX] === null) {
            hasLiberties = true;
            break;
          }
        }
        if (hasLiberties) break;
      }
      
      // If no liberties found, add all stones in group to result
      if (!hasLiberties) {
        noLibertyStones.push(...group);
      }
    });
    
    // Render debugging markers for stones with no liberties
    return noLibertyStones.map((pos, index) => (
      <g key={`no-liberty-${pos.x}-${pos.y}-${index}`} className="no-liberty-marker">
        <rect
          x={(pos.x * cellSize) - (cellSize * 0.4)}
          y={(pos.y * cellSize) - (cellSize * 0.4)}
          width={cellSize * 0.8}
          height={cellSize * 0.8}
          fill="none"
          stroke="red"
          strokeWidth={3}
          strokeDasharray="5,3"
          opacity={0.8}
        />
        <text
          x={pos.x * cellSize}
          y={pos.y * cellSize + cellSize * 0.6}
          textAnchor="middle"
          fill="red"
          fontSize={cellSize * 0.35}
          fontWeight="bold"
          opacity={0.9}
        >
          !
        </text>
      </g>
    ));
  }, [stones, size, cellSize]);
  
  return (
    <div className={`go-board-container go-board-wrapper ${testMode ? 'test-mode' : ''}`}>
      <svg
        className="go-board"
        width={boardSize + boardPadding * 4}
        height={boardSize + boardPadding * 4}
        viewBox={`${-boardPadding * 2} ${-boardPadding *2} ${boardSize + boardPadding * 4} ${boardSize + boardPadding * 4}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          backgroundColor: themeConfig.boardColor,
          backgroundImage: themeConfig.woodTexture ? WOOD_TEXTURES[themeConfig.woodTexture] : 'none',
          borderRadius: '8px',
          boxShadow: theme === 'universe' 
            ? '0 3px 8px rgba(0,0,0,0.5), inset 0 0 20px rgba(100,100,255,0.2)'
            : '0 3px 8px rgba(0,0,0,0.2), inset 0 -3px 6px rgba(0,0,0,0.1)'
        }}
      >
        {/* Background rectangle with wood texture */}
        {themeConfig.woodTexture && (
          <rect
            x={-boardPadding * 2}
            y={-boardPadding * 2}
            width={boardSize + boardPadding * 4}
            height={boardSize + boardPadding * 4}
            fill={`url(#wood-texture-${themeConfig.woodTexture})`}
            rx="8"
            ry="8"
          />
        )}
        
        {/* Wood texture definitions */}
        <defs>
          <pattern id="wood-texture-lightwood" patternUnits="userSpaceOnUse" width="200" height="200">
            <rect width="200" height="200" fill="#d9b383" />
            <filter id="wood-grain-light">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" seed="2" />
              <feDisplacementMap in="SourceGraphic" scale="5" />
            </filter>
            <rect width="200" height="200" filter="url(#wood-grain-light)" fill="#d9b383" opacity="0.8" />
          </pattern>
          
          <pattern id="wood-texture-darkwood" patternUnits="userSpaceOnUse" width="200" height="200">
            <rect width="200" height="200" fill="#6b4423" />
            <filter id="wood-grain-dark">
              <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="3" seed="3" />
              <feDisplacementMap in="SourceGraphic" scale="5" />
            </filter>
            <rect width="200" height="200" filter="url(#wood-grain-dark)" fill="#6b4423" opacity="0.8" />
          </pattern>
        </defs>
        
        {/* Coordinates - render behind the grid and stones */}
        {cellSize > 14 && <g>{renderCoordinates()}</g>}
        
        {/* Board grid */}
        <g>{renderGrid()}</g>
        
        {/* Star points */}
        <g>{renderHoshiPoints()}</g>
        
        {/* Heat map overlay - render before stones but after grid */}
        {showHeatMap && <g className="heat-map">{renderHeatMap()}</g>}
        
        {/* Captured stones' marks */}
        <g>{renderCapturedStones()}</g>
        
        {/* Ko indicator */}
        <g>{renderKoIndicator()}</g>
        
        {/* Active stones */}
        <g>{renderStones()}</g>
        
        {/* Debug markers for stones with no liberties */}
        <g>{checkStonesWithNoLiberties()}</g>
        
        {/* Interactive overlays */}
        {onClick && <g>{renderCellOverlays()}</g>}

        {/* Highlight the next move if enabled */}
        {nextMove && (
          <g className="next-move-highlight">
            <circle
              key={`next-move-${nextMove.x}-${nextMove.y}`}
              cx={nextMove.x * cellSize}
              cy={nextMove.y * cellSize}
              r={cellSize * 0.45}
              fill="rgba(0, 220, 0, 0.4)"
              stroke="rgba(0, 180, 0, 0.8)"
              strokeWidth={2}
              onClick={() => onClick && onClick(nextMove.x, nextMove.y)}
              style={{ cursor: 'pointer' }}
              className="highlighted-move"
            />
          </g>
        )}
      </svg>
    </div>
  );
};

// Memoize the entire GoBoard component to prevent unnecessary re-renders
export default React.memo(GoBoard); 