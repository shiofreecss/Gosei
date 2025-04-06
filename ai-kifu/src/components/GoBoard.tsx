import React, { useMemo, useCallback } from 'react';

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
}

const GoBoard: React.FC<GoBoardProps> = ({ 
  size = 19, 
  stones = [], 
  currentMove = -1, 
  showMoveNumbers = false,
  capturedStones = [],
  onClick 
}) => {
  const cellSize = 30;
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
  
  const renderStones = useCallback(() => {
    const visibleStones = stones.slice(0, currentMove >= 0 ? currentMove + 1 : stones.length);
    
    return visibleStones.map((stone, index) => {
      const isLatestMove = index === (currentMove >= 0 ? currentMove : stones.length - 1);
      const moveNumber = index + 1;
      const isCaptured = capturedStonesMap.has(`${stone.x},${stone.y}`);
      
      // Skip rendering if the stone is captured
      if (isCaptured) return null;
      
      return (
        <g key={`${stone.x}-${stone.y}`}>
          {/* Stone shadow */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize + 1.5}
            r={cellSize * 0.45}
            fill="rgba(0,0,0,0.15)"
            style={{ filter: 'blur(1px)' }}
          />
          
          {/* Actual stone */}
          <circle
            cx={stone.x * cellSize}
            cy={stone.y * cellSize}
            r={cellSize * 0.45}
            fill={stone.color}
            stroke={stone.color === 'black' ? '#222' : '#ddd'}
            strokeWidth={0.5}
            style={{ 
              filter: stone.color === 'black' 
                ? 'brightness(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.4))' 
                : 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
            }}
          />
          
          {/* Latest move marker (only show if not showing move numbers) */}
          {isLatestMove && !showMoveNumbers && (
            <circle
              cx={stone.x * cellSize}
              cy={stone.y * cellSize}
              r={cellSize * 0.15}
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
              fontSize={cellSize * 0.4}
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
  }, [stones, currentMove, showMoveNumbers, capturedStonesMap, cellSize]);
  
  // Render any captured stones with a special style (ghosted appearance)
  const renderCapturedStones = useCallback(() => {
    if (!capturedStones || capturedStones.length === 0) return null;
    
    // Only show captures up to the current move
    const visibleCaptures = capturedStones.filter(
      stone => stone.moveNumber <= (currentMove >= 0 ? currentMove + 1 : stones.length)
    );
    
    return visibleCaptures.map((stone, index) => (
      <g key={`captured-${stone.x}-${stone.y}-${index}`}>
        <circle
          cx={stone.x * cellSize}
          cy={stone.y * cellSize}
          r={cellSize * 0.45}
          fill={stone.color}
          opacity={0.2}
          stroke={stone.color === 'black' ? '#222' : '#ddd'}
          strokeWidth={0.5}
          strokeDasharray="4,2"
        />
      </g>
    ));
  }, [capturedStones, currentMove, stones, cellSize]);
  
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
          stroke="#444"
          strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
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
          stroke="#444"
          strokeWidth={i === 0 || i === size - 1 ? 2 : 1}
        />
      );
    }
    
    return lines;
  }, [size, cellSize, boardSize]);
  
  const renderCoordinates = useCallback(() => {
    const coords = [];
    const letters = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // Skip 'I'
    
    // Column coordinates (letters)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`col-${i}`}
          x={i * cellSize}
          y={boardSize + boardPadding * 2}
          textAnchor="middle"
          fill="#555"
          fontSize={cellSize * 0.4}
          fontFamily="sans-serif"
        >
          {letters[i]}
        </text>
      );
    }
    
    // Row coordinates (numbers)
    for (let i = 0; i < size; i++) {
      coords.push(
        <text
          key={`row-${i}`}
          x={-boardPadding * 1.5}
          y={i * cellSize + cellSize * 0.15}
          textAnchor="middle"
          fill="#555"
          fontSize={cellSize * 0.4}
          fontFamily="sans-serif"
        >
          {size - i}
        </text>
      );
    }
    
    return coords;
  }, [size, cellSize, boardSize, boardPadding]);
  
  const renderHoshiPoints = useCallback(() => {
    const points = [];
    
    for (const x of hoshiPoints) {
      for (const y of hoshiPoints) {
        points.push(
          <circle
            key={`hoshi-${x}-${y}`}
            cx={x * cellSize}
            cy={y * cellSize}
            r={3.5}
            fill="#444"
          />
        );
      }
    }
    
    return points;
  }, [hoshiPoints, cellSize]);
  
  const renderClickableAreas = useCallback(() => {
    const areas = [];
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        areas.push(
          <rect
            key={`click-${x}-${y}`}
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
    
    return areas;
  }, [size, cellSize, handleCellClick]);

  // Memoize the SVG filter definitions
  const filterDefinitions = useMemo(() => (
    <defs>
      <filter id="wood-texture" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="5" />
        <feColorMatrix type="saturate" values="0.1" />
        <feBlend mode="multiply" in="SourceGraphic" />
      </filter>
      
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
      </filter>
    </defs>
  ), []);
  
  // Memoize the board background rectangle
  const boardBackground = useMemo(() => (
    <rect
      x={-boardPadding}
      y={-boardPadding}
      width={boardSize + boardPadding * 2}
      height={boardSize + boardPadding * 2}
      fill="#e9bb7b"
      rx={4}
      ry={4}
      style={{ 
        filter: 'url(#wood-texture)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    />
  ), [boardSize, boardPadding]);
  
  return (
    <div 
      className="go-board-container" 
      style={{ 
        margin: '10px 0',
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <svg
        width={boardSize + cellSize + boardPadding * 2}
        height={boardSize + cellSize + boardPadding * 2}
        viewBox={`-${boardPadding * 2} -${boardPadding} ${boardSize + cellSize + boardPadding * 3} ${boardSize + cellSize + boardPadding * 3}`}
      >
        {/* Board background with wooden texture */}
        {boardBackground}
        
        {/* Create a subtle wood grain texture */}
        {filterDefinitions}
        
        {renderCoordinates()}
        {renderGrid()}
        {renderHoshiPoints()}
        {renderCapturedStones()}
        {renderStones()}
        {renderClickableAreas()}
      </svg>
      
      {/* Shadow effect for the board */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          borderRadius: '4px',
          boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(4px)'
        }}
      />
    </div>
  );
};

// Memoize the entire GoBoard component to prevent unnecessary re-renders
export default React.memo(GoBoard); 