import { Stone, Position, findGroup, createBoardFromStones, getAdjacentPositions } from './goRules';

export interface StoneGroup {
  stones: Position[];
  color: 'black' | 'white';
  liberties: number;
}

/**
 * Finds all connected stone groups on the board
 */
export const findAllStoneGroups = (
  board: ('black' | 'white' | null)[][]
): StoneGroup[] => {
  const boardSize = board.length;
  const visited: boolean[][] = Array(boardSize)
    .fill(false)
    .map(() => Array(boardSize).fill(false));
  
  const groups: StoneGroup[] = [];
  
  // Scan the board for stones
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const color = board[y][x];
      
      // Skip empty intersections or already visited stones
      if (color === null || visited[y][x]) continue;
      
      // Find the group of connected stones
      const groupPositions = findGroup(board, { x, y });
      
      // Mark all stones in the group as visited
      groupPositions.forEach(pos => {
        visited[pos.y][pos.x] = true;
      });
      
      // Count liberties
      let liberties = 0;
      const libertySet = new Set<string>();
      
      groupPositions.forEach(pos => {
        const adjacentPositions = getAdjacentPositions(pos, boardSize);
        
        adjacentPositions.forEach(adjPos => {
          if (board[adjPos.y][adjPos.x] === null) {
            libertySet.add(`${adjPos.x},${adjPos.y}`);
          }
        });
      });
      
      liberties = libertySet.size;
      
      // Add group to the list
      groups.push({
        stones: groupPositions,
        color,
        liberties
      });
    }
  }
  
  return groups;
};

/**
 * Generates a heat map for territory influence
 * Higher values mean stronger influence
 */
export const generateHeatMap = (
  stones: Stone[],
  boardSize: number,
  maxDistance: number = 5
): {
  blackInfluence: number[][];
  whiteInfluence: number[][];
} => {
  const board = createBoardFromStones(stones, boardSize);
  const groups = findAllStoneGroups(board);
  
  // Initialize influence maps
  const blackInfluence: number[][] = Array(boardSize)
    .fill(0)
    .map(() => Array(boardSize).fill(0));
  
  const whiteInfluence: number[][] = Array(boardSize)
    .fill(0)
    .map(() => Array(boardSize).fill(0));
  
  // For each group, calculate its influence on the board
  groups.forEach(group => {
    const influenceMap = group.color === 'black' ? blackInfluence : whiteInfluence;
    
    // Calculate base influence based on group size and liberties
    const baseInfluence = Math.sqrt(group.stones.length) * (1 + Math.min(1, group.liberties / 5));
    
    // Distribute influence from each stone in the group
    group.stones.forEach(stonePos => {
      // Mark direct position
      influenceMap[stonePos.y][stonePos.x] = baseInfluence * 2;
      
      // Spread influence to surrounding positions, decreasing with distance
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          // Skip positions that have stones
          if (board[y][x] !== null) continue;
          
          // Calculate Manhattan distance from stone
          const distance = Math.abs(stonePos.x - x) + Math.abs(stonePos.y - y);
          
          // Influence falls off with distance
          if (distance > 0 && distance <= maxDistance) {
            const influence = baseInfluence * (1 - distance / (maxDistance + 1));
            influenceMap[y][x] += influence;
          }
        }
      }
    });
  });
  
  // Normalize values to be between 0 and 1
  const normalizeMap = (map: number[][]): number[][] => {
    let maxValue = 0;
    
    // Find maximum value
    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        maxValue = Math.max(maxValue, map[y][x]);
      }
    }
    
    // Normalize if maximum is greater than 0
    if (maxValue > 0) {
      return map.map(row => row.map(value => value / maxValue));
    }
    
    return map;
  };
  
  return {
    blackInfluence: normalizeMap(blackInfluence),
    whiteInfluence: normalizeMap(whiteInfluence)
  };
}; 