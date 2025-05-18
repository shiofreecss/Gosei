import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Stone } from '../utils/goRules';
import { findAllStoneGroups, generateHeatMap } from '../utils/boardAnalysis';
import { createBoardFromStones } from '../utils/goRules';
import './WinRateChart.css';

interface WinRateChartProps {
  moveHistory: Stone[][];
  currentMove: number;
  boardSize: number;
  analysisType?: 'liberty' | 'influence';
  onAnalysisTypeChange?: (type: 'liberty' | 'influence') => void;
}

// Liberty-based win rates
const LIBERTY_WIN_RATES = [
  { advantage: -20, blackWinRate: 0.15 },
  { advantage: -15, blackWinRate: 0.25 },
  { advantage: -10, blackWinRate: 0.35 },
  { advantage: -5, blackWinRate: 0.42 },
  { advantage: 0, blackWinRate: 0.52 },  // Slightly favors black due to komi
  { advantage: 5, blackWinRate: 0.65 },
  { advantage: 10, blackWinRate: 0.78 },
  { advantage: 15, blackWinRate: 0.85 },
  { advantage: 20, blackWinRate: 0.92 },
];

// Heatmap influence win rates
const INFLUENCE_WIN_RATES = [
  { advantage: -1.0, blackWinRate: 0.05 },
  { advantage: -0.8, blackWinRate: 0.10 },
  { advantage: -0.6, blackWinRate: 0.20 },
  { advantage: -0.4, blackWinRate: 0.30 },
  { advantage: -0.3, blackWinRate: 0.35 },
  { advantage: -0.2, blackWinRate: 0.40 },
  { advantage: -0.1, blackWinRate: 0.45 },
  { advantage: 0, blackWinRate: 0.52 },  // Slightly favors black due to komi
  { advantage: 0.1, blackWinRate: 0.58 },
  { advantage: 0.2, blackWinRate: 0.65 },
  { advantage: 0.3, blackWinRate: 0.75 },
  { advantage: 0.4, blackWinRate: 0.80 },
  { advantage: 0.6, blackWinRate: 0.85 },
  { advantage: 0.8, blackWinRate: 0.90 },
  { advantage: 1.0, blackWinRate: 0.95 },
];

// Estimate win probability based on liberty advantage
const getWinProbabilityFromLiberties = (libertyAdvantage: number): number => {
  // Find the closest advantage in our reference data
  const sorted = [...LIBERTY_WIN_RATES].sort((a, b) => 
    Math.abs(a.advantage - libertyAdvantage) - Math.abs(b.advantage - libertyAdvantage)
  );
  
  if (sorted.length === 0) return 0.5;
  
  // If we have an exact match
  if (sorted[0].advantage === libertyAdvantage) {
    return sorted[0].blackWinRate;
  }
  
  // Otherwise interpolate between the two closest points
  if (sorted.length >= 2) {
    const lower = sorted.find(r => r.advantage <= libertyAdvantage) || sorted[0];
    const upper = sorted.find(r => r.advantage >= libertyAdvantage) || sorted[0];
    
    if (lower.advantage === upper.advantage) return lower.blackWinRate;
    
    // Linear interpolation
    const ratio = (libertyAdvantage - lower.advantage) / (upper.advantage - lower.advantage);
    return lower.blackWinRate + ratio * (upper.blackWinRate - lower.blackWinRate);
  }
  
  return sorted[0].blackWinRate;
};

// Estimate win probability based on heatmap influence advantage
const getWinProbabilityFromInfluence = (influenceAdvantage: number): number => {
  // Clamp the advantage value to our reference range
  const clampedAdvantage = Math.max(-1.0, Math.min(1.0, influenceAdvantage));
  
  // Find the closest advantage in our reference data
  const sorted = [...INFLUENCE_WIN_RATES].sort((a, b) => 
    Math.abs(a.advantage - clampedAdvantage) - Math.abs(b.advantage - clampedAdvantage)
  );
  
  if (sorted.length === 0) return 0.5;
  
  // If we have an exact match
  if (sorted[0].advantage === clampedAdvantage) {
    return sorted[0].blackWinRate;
  }
  
  // Otherwise interpolate between the two closest points
  if (sorted.length >= 2) {
    const lower = sorted.find(r => r.advantage <= clampedAdvantage) || sorted[0];
    const upper = sorted.find(r => r.advantage >= clampedAdvantage) || sorted[0];
    
    if (lower.advantage === upper.advantage) return lower.blackWinRate;
    
    // Linear interpolation
    const ratio = (clampedAdvantage - lower.advantage) / (upper.advantage - lower.advantage);
    return lower.blackWinRate + ratio * (upper.blackWinRate - lower.blackWinRate);
  }
  
  return sorted[0].blackWinRate;
};

// Calculate influence advantage from heatmap data
const calculateInfluenceAdvantage = (blackInfluence: number[][], whiteInfluence: number[][], boardSize: number): number => {
  let totalBlackInfluence = 0;
  let totalWhiteInfluence = 0;
  let totalPoints = 0;
  
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      totalBlackInfluence += blackInfluence[y][x];
      totalWhiteInfluence += whiteInfluence[y][x];
      totalPoints++;
    }
  }
  
  // Normalize and calculate advantage as a value between -1.0 and 1.0
  const totalInfluence = totalBlackInfluence + totalWhiteInfluence;
  if (totalInfluence === 0) return 0;
  
  const blackShare = totalBlackInfluence / totalInfluence;
  const whiteShare = totalWhiteInfluence / totalInfluence;
  
  // Return a value between -1.0 and 1.0, with positive favoring black
  return blackShare - whiteShare;
};

interface PointData {
  blackWinRate: number;
  whiteWinRate: number;
  advantage: number;
  blackLiberties: number;
  whiteLiberties: number;
  blackInfluence: number;
  whiteInfluence: number;
  goodForBlack: boolean;
  goodForWhite: boolean;
}

type AnalysisMode = 'liberty' | 'influence';

const WinRateChart: React.FC<WinRateChartProps> = ({ 
  moveHistory, 
  currentMove, 
  boardSize, 
  analysisType: propAnalysisType,
  onAnalysisTypeChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousMove, setPreviousMove] = useState(-1);
  const [animationProgress, setAnimationProgress] = useState(1); // 0 to 1
  const [localAnalysisMode, setLocalAnalysisMode] = useState<AnalysisMode>('liberty');
  
  // Use the prop if provided, otherwise use local state
  const analysisMode = propAnalysisType || localAnalysisMode;
  
  // Animation effect when current move changes
  useEffect(() => {
    if (currentMove !== previousMove) {
      setAnimationProgress(0);
      const animationStart = performance.now();
      const animationDuration = 500; // ms
      
      const animate = (time: number) => {
        const elapsed = time - animationStart;
        const progress = Math.min(elapsed / animationDuration, 1);
        setAnimationProgress(progress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      setPreviousMove(currentMove);
    }
  }, [currentMove, previousMove]);
  
  // Sync local state with prop when it changes
  useEffect(() => {
    if (propAnalysisType && propAnalysisType !== localAnalysisMode) {
      setLocalAnalysisMode(propAnalysisType);
    }
  }, [propAnalysisType, localAnalysisMode]);
  
  // Calculate win rates and other data for all moves
  const pointData = useMemo(() => {
    setIsLoading(true);
    
    const data = moveHistory.map(stones => {
      const board = createBoardFromStones(stones, boardSize);
      const groups = findAllStoneGroups(board);
      const heatMapData = generateHeatMap(stones, boardSize);
      
      let blackTotal = 0;
      let whiteTotal = 0;
      
      groups.forEach(group => {
        if (group.color === 'black') {
          blackTotal += group.liberties;
        } else {
          whiteTotal += group.liberties;
        }
      });
      
      const libertyAdvantage = blackTotal - whiteTotal;
      
      // Calculate influence advantage from heatmap
      const influenceAdvantage = calculateInfluenceAdvantage(
        heatMapData.blackInfluence, 
        heatMapData.whiteInfluence, 
        boardSize
      );
      
      // Calculate win rates using both methods
      const blackWinRateLiberty = getWinProbabilityFromLiberties(libertyAdvantage);
      const blackWinRateInfluence = getWinProbabilityFromInfluence(influenceAdvantage);
      
      // Use the selected analysis mode to determine win rate
      const blackWinRate = analysisMode === 'liberty' ? blackWinRateLiberty : blackWinRateInfluence;
      
      // Calculate total influence values (for display)
      let totalBlackInfluence = 0;
      let totalWhiteInfluence = 0;
      
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          totalBlackInfluence += heatMapData.blackInfluence[y][x];
          totalWhiteInfluence += heatMapData.whiteInfluence[y][x];
        }
      }
      
      // Mark significant moves (more than 5% change in win rate)
      const goodForBlack = false; // We'll calculate this after generating all data
      const goodForWhite = false; // We'll calculate this after generating all data
      
      return { 
        blackWinRate,
        whiteWinRate: 1 - blackWinRate,
        advantage: analysisMode === 'liberty' ? libertyAdvantage : influenceAdvantage,
        blackLiberties: blackTotal,
        whiteLiberties: whiteTotal,
        blackInfluence: totalBlackInfluence,
        whiteInfluence: totalWhiteInfluence,
        goodForBlack,
        goodForWhite
      };
    });
    
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
    
    return data;
  }, [moveHistory, boardSize, analysisMode]);
  
  // Mark significant moves after we have all the data
  const dataWithSignificantMoves = useMemo(() => {
    if (pointData.length < 2) return pointData;
    
    return pointData.map((point, i) => {
      if (i === 0) return point;
      
      const prevPoint = pointData[i - 1];
      const winRateChange = point.blackWinRate - prevPoint.blackWinRate;
      
      // If win rate changed by more than 5%, mark it as significant
      const goodForBlack = winRateChange > 0.05;
      const goodForWhite = winRateChange < -0.05;
      
      return {
        ...point,
        goodForBlack,
        goodForWhite
      };
    });
  }, [pointData]);
  
  // Draw the chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dataWithSignificantMoves.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    
    // Chart dimensions
    const chartHeight = height * 0.8;
    const chartTop = height * 0.1;
    const chartBottom = chartTop + chartHeight;
    
    // Draw background sections
    // Black section (bottom)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, chartTop + chartHeight / 2, width, chartHeight / 2);

    // White/gray section (top)
    ctx.fillStyle = '#555555'; 
    ctx.fillRect(0, chartTop, width, chartHeight / 2);
    
    // Draw grid lines
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 0; i <= 4; i++) {
      const y = chartTop + (chartHeight * i / 4);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 50% line (equal win probability) in different color
    ctx.strokeStyle = '#777';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.setLineDash([5, 3]);
    ctx.moveTo(0, chartTop + chartHeight / 2);
    ctx.lineTo(width, chartTop + chartHeight / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Get current animated point if in transition, otherwise use actual point
    let displayCurrentMove = currentMove;
    if (animationProgress < 1 && previousMove >= 0 && previousMove < dataWithSignificantMoves.length) {
      // We're animating between moves
      displayCurrentMove = Math.floor(previousMove + (currentMove - previousMove) * animationProgress);
    }
    
    // Score labels - show different values based on analysis mode
    let blackScore;
    let whiteScore;
    
    if (displayCurrentMove >= 0 && displayCurrentMove < dataWithSignificantMoves.length) {
      const currentData = dataWithSignificantMoves[displayCurrentMove];
      if (analysisMode === 'liberty') {
        blackScore = Math.round(currentData.blackLiberties);
        whiteScore = Math.round(currentData.whiteLiberties);
      } else {
        blackScore = Math.round(currentData.blackInfluence * 100);
        whiteScore = Math.round(currentData.whiteInfluence * 100);
      }
    } else {
      blackScore = 0;
      whiteScore = 0;
    }
    
    // Add B and W labels with dynamic percentages 
    const blackWinPct = displayCurrentMove >= 0 && displayCurrentMove < dataWithSignificantMoves.length
      ? (dataWithSignificantMoves[displayCurrentMove].blackWinRate * 100).toFixed(1)
      : "50.0";
    const whiteWinPct = displayCurrentMove >= 0 && displayCurrentMove < dataWithSignificantMoves.length
      ? (dataWithSignificantMoves[displayCurrentMove].whiteWinRate * 100).toFixed(1)
      : "50.0";
    
    // Draw score and percentage labels
    ctx.font = 'bold 14px Arial';
    
    // Black labels
    // Add background for better visibility
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(2, chartTop - 20, 60, 18);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`B+${blackScore}`, 5, chartTop - 5);
    
    // White labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(2, chartBottom + 2, 60, 18);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`W+${whiteScore}`, 5, chartBottom + 15);
    
    // Win percentage labels (right side)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    const blackTextWidth = ctx.measureText(`${blackWinPct}%`).width;
    ctx.fillRect(width - blackTextWidth - 8, chartTop - 20, blackTextWidth + 6, 18);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText(`${blackWinPct}%`, width - 5, chartTop - 5);
    
    const whiteTextWidth = ctx.measureText(`${whiteWinPct}%`).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(width - whiteTextWidth - 8, chartBottom + 2, whiteTextWidth + 6, 18);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'right';
    ctx.fillText(`${whiteWinPct}%`, width - 5, chartBottom + 15);
    
    // Skip drawing the line if there's only one point
    if (dataWithSignificantMoves.length <= 1) return;
    
    // Calculate scaling
    const xScale = width / (dataWithSignificantMoves.length - 1);

    // Draw win rate line
    // First draw a wider glow line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    dataWithSignificantMoves.forEach((point, i) => {
      const x = i * xScale;
      const y = chartTop + chartHeight * (1 - point.blackWinRate);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Then draw the main line on top
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    dataWithSignificantMoves.forEach((point, i) => {
      const x = i * xScale;
      const y = chartTop + chartHeight * (1 - point.blackWinRate);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw significant moves as vertical bars at the top and bottom
    dataWithSignificantMoves.forEach((point, i) => {
      if (point.goodForBlack) {
        // Draw red bar at the top for good black moves
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(i * xScale - 1, 0, 2, chartTop);
      } else if (point.goodForWhite) {
        // Draw red bar at the bottom for good white moves
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(i * xScale - 1, chartBottom, 2, height - chartBottom);
      }
    });
    
    // Current move highlight with a vertical line - use the animated position
    if (displayCurrentMove >= 0 && displayCurrentMove < dataWithSignificantMoves.length) {
      // Calculate potentially fractional x position for smooth animation
      const exactPosition = previousMove + (currentMove - previousMove) * animationProgress;
      const x = exactPosition * xScale;
      
      // Blue vertical line
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // Add glow effect around the line
      ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      if (isExpanded) {
        // Add current win rates as text when expanded
        const currentPointIndex = Math.min(Math.floor(exactPosition), dataWithSignificantMoves.length - 1);
        const currentPoint = dataWithSignificantMoves[currentPointIndex];
        const blackText = `Black: ${(currentPoint.blackWinRate * 100).toFixed(1)}%`;
        const whiteText = `White: ${(currentPoint.whiteWinRate * 100).toFixed(1)}%`;
        
        // Background for text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        const textWidth = 100;
        ctx.fillRect(
          Math.min(Math.max(x - textWidth/2, 0), width - textWidth), 
          chartTop + chartHeight/2 - 30, 
          textWidth, 
          60
        );
        
        // Text
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(
          blackText, 
          Math.min(Math.max(x, textWidth/2), width - textWidth/2), 
          chartTop + chartHeight/2 - 10
        );
        
        ctx.fillStyle = '#ddd';
        ctx.fillText(
          whiteText, 
          Math.min(Math.max(x, textWidth/2), width - textWidth/2), 
          chartTop + chartHeight/2 + 10
        );
      }
    }
    
  }, [dataWithSignificantMoves, currentMove, previousMove, animationProgress, isExpanded, analysisMode]);
  
  // Current win rate for display
  const currentWinRate = currentMove >= 0 && currentMove < dataWithSignificantMoves.length 
    ? dataWithSignificantMoves[currentMove]
    : dataWithSignificantMoves[dataWithSignificantMoves.length - 1];
  
  // Toggle between analysis modes
  const toggleAnalysisMode = (newMode: 'liberty' | 'influence') => {
    if (onAnalysisTypeChange) {
      // If the parent provided a handler, use it
      onAnalysisTypeChange(newMode);
    } else {
      // Otherwise fall back to local state
      setIsLoading(true);
      setLocalAnalysisMode(newMode);
    }
  };
  
  return (
    <div className={`win-rate-chart ${isExpanded ? 'expanded' : ''}`}>
      <div className="chart-header">
        <div className="chart-title-container">
          <span className="chart-title">Score Graph</span>
          <button 
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
          >
            {isExpanded ? '▼' : '▲'}
          </button>
          <div className="analysis-mode-toggle">
            <button
              className={`mode-button ${analysisMode === 'liberty' ? 'active' : ''}`}
              onClick={() => analysisMode !== 'liberty' && toggleAnalysisMode('liberty')}
              title="Liberty-based analysis"
            >
              Liberty
            </button>
            <button
              className={`mode-button ${analysisMode === 'influence' ? 'active' : ''}`}
              onClick={() => analysisMode !== 'influence' && toggleAnalysisMode('influence')}
              title="Influence-based analysis"
            >
              Influence
            </button>
          </div>
        </div>
        <div className="current-win-rate">
          <div className={`win-rate-indicator ${previousMove !== currentMove ? 'win-rate-updating' : ''}`}>
            <span className="black-indicator"></span>
            <span>{(currentWinRate?.blackWinRate * 100 || 0).toFixed(1)}%</span>
          </div>
          <div className={`win-rate-indicator ${previousMove !== currentMove ? 'win-rate-updating' : ''}`}>
            <span className="white-indicator"></span>
            <span>{(currentWinRate?.whiteWinRate * 100 || 0).toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div className={`chart-container ${isExpanded ? 'expanded' : ''}`}>
        {isLoading ? (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        ) : null}
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={isExpanded ? 300 : 150}
          className="win-rate-canvas"
        />
      </div>
    </div>
  );
};

export default WinRateChart; 