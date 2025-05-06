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
  showHeatMap = false
}) => {
  // Make cellSize responsive based on screen width
  const [cellSize, setCellSize] = useState(32);
  
  // Get the theme configuration
  const themeConfig = BOARD_THEMES[theme] || BOARD_THEMES.default;
  
  // Add effect to adjust cell size based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 360) {
        setCellSize(13); // Very small screens
      } else if (width <= 480) {
        setCellSize(15); // Small mobile
      } else if (width <= 768) {
        setCellSize(20); // Tablets
      } else if (width <= 1024) {
        setCellSize(28); // Small laptops
      } else {
        setCellSize(32); // Default size
      }
    };
    
    // Initial size
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const boardSize = (size - 1) * cellSize;
  const boardPadding = cellSize / 2;
  
  // Calculate positions for star points (hoshi)
  const getHoshiPoints = useCallback((boardSize: number) => {
    if (size === 19) return [3, 9, 15];
    if (size === 13) return [3, 6, 9];
    if (size === 9) return [2, 4, 6];
    return [];
  }, [size]);
  
  const hoshiPoints = useMemo(() => getHoshiPoints(size), [getHoshiPoints, size]);
  
  const handleCellClick = useCallback((x: number, y: number) => {
    if (onClick) onClick(x, y);
  }, [onClick]);
  
  // Create a map of captured stones for easier lookup
  const capturedStonesMap = useMemo(() => {
    const map = new Map<string, CapturedStone>();
    if (capturedStones.length > 0) {
      capturedStones.forEach(stone => {
        map.set(`${stone.x},${stone.y}`, stone);
      });
    }
    return map;
  }, [capturedStones]);
  
  // Determine if a stone at given coordinates is captured
  const isStoneVisible = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    if (!capturedStonesMap.has(key)) return true;
    
    // If stone is in the captured map, it's not visible
    return false;
  }, [capturedStonesMap]);
  
  // Generate heat map data when stones change or when toggled
  const heatMapData = useMemo(() => {
    if (!showHeatMap) return null;
    return generateHeatMap(stones.slice(0, currentMove >= 0 ? currentMove + 1 : stones.length), size);
  }, [showHeatMap, stones, currentMove, size]);
  
  const renderStones = useCallback(() => {
    const visibleStones = stones.slice(0, currentMove >= 0 ? currentMove + 1 : stones.length);
    
    return visibleStones.map((stone, index) => {
      const isLatestMove = index === (currentMove >= 0 ? currentMove : visibleStones.length - 1);
      const moveNumber = index + 1;
      
      // Skip rendering if the stone is captured
      if (!isStoneVisible(stone.x, stone.y)) return null;
      
      // Adjust stone size for better visibility on small screens
      const stoneRadius = cellSize <= 15 ? cellSize * 0.48 : cellSize * 0.45;
      
      return (
        <g key={`${stone.x}-${stone.y}`}>
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
          {isLatestMove && !showMoveNumbers && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.18} // Larger indicator
              fill={stone.color === 'black' ? 'white' : 'black'}
              opacity={0.8}
            />
          )}
          
          {/* Move number */}
          {showMoveNumbers && (
            <text
              x={stone.x * cellSize}
              y={stone.y * cellSize + 5}
              textAnchor="middle"
              fontSize={cellSize * 0.4} // Larger font for better readability
              fontFamily="sans-serif"
              fontWeight="bold"
              fill={stone.color === 'black' ? 'white' : 'black'}
              style={{ userSelect: 'none' }}
            >
              {moveNumber}
            </text>
          )}
        </g>
      );
    });
  }, [stones, currentMove, showMoveNumbers, isStoneVisible, cellSize, themeConfig.stoneEffects, themeConfig.stoneGradient]);
  
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
  }, [size, cellSize, stones, isStoneVisible, onClick, handleCellClick]);
  
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
  
  return (
    <div className="go-board-container">
      <svg
        className="go-board"
        width={boardSize + boardPadding * 4}
        height={boardSize + boardPadding * 4}
        viewBox={`${-boardPadding * 2} ${-boardPadding *2} ${boardSize + boardPadding * 4} ${boardSize + boardPadding * 4}`}
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
        
        {/* Active stones */}
        <g>{renderStones()}</g>
        
        {/* Interactive overlays */}
        {onClick && <g>{renderCellOverlays()}</g>}
      </svg>
    </div>
  );
};

// Memoize the entire GoBoard component to prevent unnecessary re-renders
export default React.memo(GoBoard); 