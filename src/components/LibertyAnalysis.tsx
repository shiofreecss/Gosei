import React, { useState, useEffect, useMemo } from 'react';
import { Stone } from '../utils/goRules';
import { findAllStoneGroups } from '../utils/boardAnalysis';
import { createBoardFromStones } from '../utils/goRules';
import './LibertyAnalysis.css';

// Historical win rates based on liberty advantage (based on simulated data)
// This would ideally come from real game statistics
const WIN_RATES = [
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

interface LibertyAnalysisProps {
  stones: Stone[];
  boardSize: number;
}

const LibertyAnalysis: React.FC<LibertyAnalysisProps> = ({ stones, boardSize }) => {
  // Track previous liberty values for animation
  const [prevBlackLiberties, setPrevBlackLiberties] = useState(0);
  const [prevWhiteLiberties, setPrevWhiteLiberties] = useState(0);
  const [isBlackChanged, setIsBlackChanged] = useState(false);
  const [isWhiteChanged, setIsWhiteChanged] = useState(false);
  
  // Calculate liberty totals for both black and white
  const { blackLiberties, whiteLiberties, blackGroups, whiteGroups } = useMemo(() => {
    const board = createBoardFromStones(stones, boardSize);
    const groups = findAllStoneGroups(board);
    
    let blackTotal = 0;
    let whiteTotal = 0;
    const blackGroupsCount = groups.filter(g => g.color === 'black').length;
    const whiteGroupsCount = groups.filter(g => g.color === 'white').length;
    
    groups.forEach(group => {
      if (group.color === 'black') {
        blackTotal += group.liberties;
      } else {
        whiteTotal += group.liberties;
      }
    });
    
    return { 
      blackLiberties: blackTotal, 
      whiteLiberties: whiteTotal,
      blackGroups: blackGroupsCount,
      whiteGroups: whiteGroupsCount
    };
  }, [stones, boardSize]);
  
  // Add effect to detect changes for animation
  useEffect(() => {
    if (prevBlackLiberties !== blackLiberties) {
      setIsBlackChanged(true);
      setTimeout(() => setIsBlackChanged(false), 600);
      setPrevBlackLiberties(blackLiberties);
    }
    
    if (prevWhiteLiberties !== whiteLiberties) {
      setIsWhiteChanged(true);
      setTimeout(() => setIsWhiteChanged(false), 600);
      setPrevWhiteLiberties(whiteLiberties);
    }
  }, [blackLiberties, whiteLiberties, prevBlackLiberties, prevWhiteLiberties]);
  
  // Calculate liberty advantage and determine win probability
  const advantage = blackLiberties - whiteLiberties;
  
  // Estimate win probability based on advantage
  const getWinProbability = (libertyAdvantage: number): number => {
    // Find the closest advantage in our reference data
    const sorted = [...WIN_RATES].sort((a, b) => 
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
  
  const blackWinRate = getWinProbability(advantage);
  const whiteWinRate = 1 - blackWinRate;
  
  // Scale for the visualization
  const total = blackLiberties + whiteLiberties;
  const blackPercent = total === 0 ? 50 : (blackLiberties / total) * 100;
  const whitePercent = total === 0 ? 50 : (whiteLiberties / total) * 100;
  
  return (
    <div className="liberty-analysis">
      <div className="liberty-heading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3v18h18" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 17l4-6 6-3" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="7" cy="14" r="3" fill="#333" fillOpacity="0.7" />
          <circle cx="11" cy="11" r="3" fill="#333" fillOpacity="0.5" />
          <circle cx="17" cy="8" r="3" fill="#777" fillOpacity="0.5" />
        </svg>
        Liberty Analysis
      </div>
      
      {/* Liberty Bar Chart */}
      <div className="chart-row">
        <div className="chart-label">Liberties</div>
        <div className="bar-container">
          <div 
            className="black-bar"
            style={{ width: `${blackPercent}%` }}
          />
          <div 
            className="white-bar"
            style={{ width: `${whitePercent}%` }}
          />
        </div>
        <div className={`stat-values ${isBlackChanged || isWhiteChanged ? 'value-changed' : ''}`}>
          <span className="black-value">{blackLiberties}</span>
          {' : '}
          <span className="white-value">{whiteLiberties}</span>
        </div>
      </div>
      
      {/* Groups Count */}
      <div className="chart-row">
        <div className="chart-label">Groups</div>
        <div className="stat-values">
          <span className="black-value">{blackGroups}</span>
          {' : '}
          <span className="white-value">{whiteGroups}</span>
        </div>
      </div>
      
      {/* Liberty Advantage */}
      <div className="chart-row">
        <div className="chart-label">Advantage</div>
        <div className="stat-values">
          {advantage > 0 ? (
            <span className="black-value advantage-value">+{advantage} to Black</span>
          ) : advantage < 0 ? (
            <span className="white-value advantage-value">+{Math.abs(advantage)} to White</span>
          ) : (
            <span>Even</span>
          )}
        </div>
      </div>
      
      {/* Win Rate Bar */}
      <div className="chart-row">
        <div className="chart-label">Win Prob</div>
        <div className="bar-container">
          <div 
            className="black-bar"
            style={{ width: `${blackWinRate * 100}%` }}
          />
          <div 
            className="white-bar"
            style={{ width: `${whiteWinRate * 100}%` }}
          />
        </div>
        <div className="stat-values">
          <span className="black-value">{(blackWinRate * 100).toFixed(1)}%</span>
          {' : '}
          <span className="white-value">{(whiteWinRate * 100).toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Estimated Winner */}
      <div className="win-ratio">
        <span 
          className="win-indicator"
          style={{
            background: blackWinRate > whiteWinRate ? '#333' : '#eee',
            border: '1px solid #ddd'
          }}
        />
        {blackWinRate > whiteWinRate 
          ? 'Black favored' 
          : whiteWinRate > blackWinRate 
            ? 'White favored' 
            : 'Even chances'}
      </div>
    </div>
  );
};

export default LibertyAnalysis; 