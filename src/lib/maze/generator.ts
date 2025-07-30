import { 
  MazeCell, 
  MazeCellType, 
  MazeSize, 
  MazeDifficulty, 
  Direction,
  MAZE_SIZES,
  MAZE_DIFFICULTIES
} from './types';

// Position interface for cleaner code
export interface Position {
  row: number;
  col: number;
}

// Direction vectors for movement
const DIRECTIONS: Record<Direction, Position> = {
  up: { row: -2, col: 0 },    // Move by 2 for wall carving
  down: { row: 2, col: 0 },
  left: { row: 0, col: -2 },
  right: { row: 0, col: 2 }
};

// Array of directions for iteration
const DIRECTION_KEYS: Direction[] = ['up', 'down', 'left', 'right'];

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates a maze using Recursive Backtracking algorithm
 * @param size - The size of the maze (small, medium, large)
 * @param difficulty - The difficulty level affecting path complexity
 * @returns Object containing the maze grid and optimal solution path
 */
export function generateMaze(
  size: MazeSize, 
  difficulty: MazeDifficulty
): { 
  maze: MazeCell[][], 
  solution: Position[] 
} {
  const gridSize = MAZE_SIZES[size].gridSize;
  const pathComplexity = MAZE_DIFFICULTIES[difficulty].pathComplexity;
  
  console.log(`Generating ${size} maze (${gridSize}x${gridSize}) with ${difficulty} difficulty`);
  
  // Ensure grid size is odd for proper maze generation
  const mazeSize = gridSize % 2 === 0 ? gridSize + 1 : gridSize;
  
  // Initialize maze with all walls
  const maze: MazeCell[][] = Array(mazeSize).fill(null).map((_, row) =>
    Array(mazeSize).fill(null).map((_, col) => ({
      row,
      col,
      type: 'wall' as MazeCellType,
      visited: false
    }))
  );
  
  // Generate the maze structure using recursive backtracking
  generateMazeRecursive(maze, 1, 1, mazeSize);
  
  // Trim maze back to requested size if needed
  const finalMaze = maze.slice(0, gridSize).map(row => row.slice(0, gridSize));
  
  // Set start and end positions
  const start: Position = { row: 1, col: 1 };
  const end: Position = { row: gridSize - 2, col: gridSize - 2 };
  
  // Ensure end position is on an odd coordinate and is empty
  if (end.row % 2 === 0) end.row--;
  if (end.col % 2 === 0) end.col--;
  
  // Ensure positions are within the finalMaze bounds
  console.log(`Setting start at (${start.row}, ${start.col}) and end at (${end.row}, ${end.col})`);
  console.log(`Final maze dimensions: ${finalMaze.length}x${finalMaze[0].length}`);
  
  finalMaze[start.row][start.col].type = 'start';
  finalMaze[end.row][end.col].type = 'end';
  
  // Find the optimal solution
  const solution = findPath(finalMaze, start, end) || [];
  
  // Add complexity based on difficulty
  if (pathComplexity > 0.9) {
    // For extreme difficulty, DO NOT add any complexity that creates loops
    // The recursive backtracking already creates a perfect maze (single solution)
    console.log('EXTREME DIFFICULTY: Maintaining perfect maze (single solution)');
    
    // Only add dead ends that don't create alternative paths
    addExtremeDifficulty(finalMaze, gridSize, solution);
    
  } else if (pathComplexity > 0.5) {
    // For easy/medium difficulty, add some loops
    addComplexity(finalMaze, gridSize, pathComplexity);
  }
  
  // Debug print for small mazes or extreme difficulty
  if (gridSize <= 15 || pathComplexity > 0.9) {
    printMaze(finalMaze);
    
    // Count paths for debugging
    if (pathComplexity > 0.9) {
      console.log('Verifying maze has single solution...');
      const paths = countAllPaths(finalMaze, start, end);
      console.log(`Total number of distinct paths from start to end: ${paths}`);
      if (paths > 1) {
        console.error('ERROR: Maze has multiple solutions!');
      }
    }
  }
  
  console.log(`Maze generated. Solution path length: ${solution.length}`);
  
  return { maze: finalMaze, solution };
}

/**
 * Recursive maze generation using backtracking
 */
function generateMazeRecursive(maze: MazeCell[][], row: number, col: number, size: number): void {
  // Mark current cell as path
  maze[row][col].type = 'empty';
  maze[row][col].visited = true;
  
  // Get randomized directions
  const directions = shuffleDirections();
  
  // Try each direction
  for (const dir of directions) {
    const newRow = row + DIRECTIONS[dir].row;
    const newCol = col + DIRECTIONS[dir].col;
    
    // Check if the new position is valid and unvisited
    if (isValidPosition(newRow, newCol, size) && maze[newRow][newCol].type === 'wall') {
      // Carve path to new cell
      const wallRow = row + DIRECTIONS[dir].row / 2;
      const wallCol = col + DIRECTIONS[dir].col / 2;
      maze[wallRow][wallCol].type = 'empty';
      maze[wallRow][wallCol].visited = true;
      
      // Recursively generate from new position
      generateMazeRecursive(maze, newRow, newCol, size);
    }
  }
}

/**
 * Check if position is valid and on odd coordinates
 */
function isValidPosition(row: number, col: number, size: number): boolean {
  return row > 0 && row < size - 1 && 
         col > 0 && col < size - 1 && 
         row % 2 === 1 && col % 2 === 1;
}

/**
 * Shuffle directions randomly
 */
function shuffleDirections(): Direction[] {
  const dirs = [...DIRECTION_KEYS];
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  return dirs;
}

/**
 * Add extreme difficulty by creating many dead ends without creating alternate paths
 * This ensures ONLY ONE solution path exists in the maze
 */
function addExtremeDifficulty(maze: MazeCell[][], size: number, solution: Position[]): void {
  console.log('\n=== EXTREME DIFFICULTY MODE ACTIVATED ===');
  console.log('Initial solution path length:', solution.length);
  
  // First, verify we have a perfect maze (no loops)
  const initialPaths = countAllPaths(maze, solution[0], solution[solution.length - 1]);
  console.log('Initial number of paths:', initialPaths);
  
  if (initialPaths > 1) {
    console.error('WARNING: Maze already has multiple paths before adding difficulty!');
  }
  
  let deadEndsCreated = 0;
  const solutionSet = new Set(solution.map(pos => `${pos.row},${pos.col}`));
  
  // Create a map of all empty cells and their connections
  const emptyCells = new Map<string, number>();
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (maze[row][col].type === 'empty' || maze[row][col].type === 'start' || maze[row][col].type === 'end') {
        let connections = 0;
        const neighbors = [
          { r: row - 1, c: col },
          { r: row + 1, c: col },
          { r: row, c: col - 1 },
          { r: row, c: col + 1 }
        ];
        for (const n of neighbors) {
          if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
            if (maze[n.r][n.c].type !== 'wall') {
              connections++;
            }
          }
        }
        emptyCells.set(`${row},${col}`, connections);
      }
    }
  }
  
  // Find all walls adjacent to exactly one empty cell (perfect for dead ends)
  const potentialDeadEnds: Position[] = [];
  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      if (maze[row][col].type === 'wall') {
        let adjacentEmpty = 0;
        let emptyNeighbor: Position | null = null;
        
        const neighbors = [
          { row: row - 1, col: col },
          { row: row + 1, col: col },
          { row: row, col: col - 1 },
          { row: row, col: col + 1 }
        ];
        
        for (const n of neighbors) {
          if (n.row >= 0 && n.row < size && n.col >= 0 && n.col < size) {
            if (maze[n.row][n.col].type !== 'wall') {
              adjacentEmpty++;
              emptyNeighbor = n;
            }
          }
        }
        
        // Perfect dead end candidate: wall with exactly one empty neighbor
        if (adjacentEmpty === 1 && emptyNeighbor) {
          // Don't create dead ends directly off the solution path to avoid making it too obvious
          const neighborKey = `${emptyNeighbor.row},${emptyNeighbor.col}`;
          if (!solutionSet.has(neighborKey) || Math.random() < 0.3) {
            potentialDeadEnds.push({ row, col });
          }
        }
      }
    }
  }
  
  // Shuffle and create dead ends
  const shuffledDeadEnds = shuffleArray(potentialDeadEnds);
  const maxDeadEnds = Math.min(Math.floor(size * 2), shuffledDeadEnds.length); // MANY more dead ends for extreme difficulty
  
  console.log(`Creating up to ${maxDeadEnds} dead ends from ${shuffledDeadEnds.length} candidates`);
  
  for (let i = 0; i < maxDeadEnds; i++) {
    const pos = shuffledDeadEnds[i];
    
    // Double-check this won't create a loop
    let willCreateLoop = false;
    const extendedNeighbors = [
      { row: pos.row - 1, col: pos.col },
      { row: pos.row + 1, col: pos.col },
      { row: pos.row, col: pos.col - 1 },
      { row: pos.row, col: pos.col + 1 }
    ];
    
    let emptyCount = 0;
    for (const n of extendedNeighbors) {
      if (n.row >= 0 && n.row < size && n.col >= 0 && n.col < size) {
        if (maze[n.row][n.col].type !== 'wall') {
          emptyCount++;
        }
      }
    }
    
    if (emptyCount === 1) {
      maze[pos.row][pos.col].type = 'empty';
      deadEndsCreated++;
      
      // Extend this dead end to make it longer and more misleading
      let currentPos = pos;
      const maxLength = 10 + Math.floor(Math.random() * 20); // 10-29 cells long for EXTREME difficulty
      
      for (let j = 0; j < maxLength; j++) {
        // Find a direction to extend that won't create a loop
        let extended = false;
        const directions = shuffleArray(['up', 'down', 'left', 'right'] as Direction[]);
        
        for (const dir of directions) {
          const delta = DIRECTIONS[dir];
          const nextRow = currentPos.row + delta.row / 2;
          const nextCol = currentPos.col + delta.col / 2;
          
          if (nextRow > 0 && nextRow < size - 1 && 
              nextCol > 0 && nextCol < size - 1 &&
              maze[nextRow][nextCol].type === 'wall') {
            
            // Check ALL neighbors of the potential new cell
            let isSafe = true;
            let adjacentEmptyCount = 0;
            
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                if (Math.abs(dr) + Math.abs(dc) === 1) { // Only orthogonal
                  const checkRow = nextRow + dr;
                  const checkCol = nextCol + dc;
                  
                  if (checkRow >= 0 && checkRow < size && 
                      checkCol >= 0 && checkCol < size) {
                    if (maze[checkRow][checkCol].type !== 'wall') {
                      // Allow connection to current position
                      if (checkRow === currentPos.row && checkCol === currentPos.col) {
                        adjacentEmptyCount++;
                      } else {
                        // Any other empty cell means this would create a loop
                        isSafe = false;
                        break;
                      }
                    }
                  }
                }
              }
              if (!isSafe) break;
            }
            
            // Only extend if it's safe (exactly one connection back to current)
            if (isSafe && adjacentEmptyCount === 1) {
              maze[nextRow][nextCol].type = 'empty';
              currentPos = { row: nextRow, col: nextCol };
              extended = true;
              break;
            }
          }
        }
        
        if (!extended) break;
      }
    }
  }
  
  console.log(`Added EXTREME difficulty: created ${deadEndsCreated} dead ends with NO alternate paths`);
  
  // Final verification
  const finalPaths = countAllPaths(maze, solution[0], solution[solution.length - 1]);
  console.log('Final number of paths after adding dead ends:', finalPaths);
  
  if (finalPaths > 1) {
    console.error(`ERROR: Maze still has ${finalPaths} paths! Need to fix the algorithm.`);
  } else {
    console.log('✓ SUCCESS: Maze has exactly ONE solution path!');
  }
}

/**
 * Add complexity to the maze by removing some walls (for easy/medium difficulty)
 */
function addComplexity(maze: MazeCell[][], size: number, complexity: number): void {
  let removed = 0;
  const wallsToRemove = Math.floor(size * complexity);
  
  // For easy/medium difficulty, create a few loops by removing walls between paths
  for (let attempts = 0; attempts < wallsToRemove * 10 && removed < wallsToRemove; attempts++) {
    const row = 1 + Math.floor(Math.random() * (size - 2));
    const col = 1 + Math.floor(Math.random() * (size - 2));
    
    if (maze[row][col].type === 'wall') {
      // Count adjacent empty cells
      let emptyCount = 0;
      const neighbors = [
        { r: row - 1, c: col },
        { r: row + 1, c: col },
        { r: row, c: col - 1 },
        { r: row, c: col + 1 }
      ];
      
      for (const n of neighbors) {
        if (n.r >= 0 && n.r < size && n.c >= 0 && n.c < size) {
          if (maze[n.r][n.c].type !== 'wall') {
            emptyCount++;
          }
        }
      }
      
      // Only remove if it connects exactly 2 empty cells (creates a loop)
      if (emptyCount === 2) {
        maze[row][col].type = 'empty';
        removed++;
      }
    }
  }
  
  console.log(`Added complexity: removed ${removed} walls`);
}

/**
 * Print maze for debugging
 */
function printMaze(maze: MazeCell[][]): void {
  console.log('\nGenerated Maze:');
  let output = '';
  for (const row of maze) {
    for (const cell of row) {
      switch (cell.type) {
        case 'wall': output += '█'; break;
        case 'start': output += 'S'; break;
        case 'end': output += 'E'; break;
        default: output += ' ';
      }
    }
    output += '\n';
  }
  console.log(output);
}

/**
 * Find shortest path using BFS
 */
export function findPath(
  maze: MazeCell[][],
  start: Position,
  end: Position
): Position[] | null {
  const queue: { pos: Position; path: Position[] }[] = [];
  const visited = new Set<string>();
  
  queue.push({ pos: start, path: [start] });
  visited.add(`${start.row},${start.col}`);
  
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    
    if (pos.row === end.row && pos.col === end.col) {
      return path;
    }
    
    for (const dir of directions) {
      const newRow = pos.row + dir.row;
      const newCol = pos.col + dir.col;
      const key = `${newRow},${newCol}`;
      
      if (
        newRow >= 0 && newRow < maze.length &&
        newCol >= 0 && newCol < maze[0].length &&
        !visited.has(key) &&
        maze[newRow][newCol].type !== 'wall'
      ) {
        visited.add(key);
        queue.push({
          pos: { row: newRow, col: newCol },
          path: [...path, { row: newRow, col: newCol }]
        });
      }
    }
  }
  
  return null;
}

/**
 * Get available directions from a position
 */
export function getAvailableDirections(
  maze: MazeCell[][],
  position: Position
): Direction[] {
  const available: Direction[] = [];
  const simpleDirections: Record<Direction, Position> = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 }
  };
  
  for (const [dir, delta] of Object.entries(simpleDirections) as [Direction, Position][]) {
    const newRow = position.row + delta.row;
    const newCol = position.col + delta.col;
    
    if (
      newRow >= 0 && newRow < maze.length &&
      newCol >= 0 && newCol < maze[0].length &&
      maze[newRow][newCol].type !== 'wall'
    ) {
      available.push(dir);
    }
  }
  
  return available;
}

/**
 * Check if a move is valid
 */
export function isValidMove(
  maze: MazeCell[][],
  from: Position,
  to: Position
): boolean {
  // Check if positions are adjacent
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  
  if (rowDiff + colDiff !== 1) {
    return false;
  }
  
  // Check if target is not a wall
  const targetCell = maze[to.row]?.[to.col];
  return targetCell && targetCell.type !== 'wall';
}

/**
 * Get all valid neighbors
 */
export function getNeighbors(maze: MazeCell[][], position: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];
  
  for (const dir of directions) {
    const newRow = position.row + dir.row;
    const newCol = position.col + dir.col;
    
    if (
      newRow >= 0 && newRow < maze.length &&
      newCol >= 0 && newCol < maze[0].length
    ) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
}

/**
 * Validate maze has a solution
 */
export function validateMaze(maze: MazeCell[][]): boolean {
  let start: Position | null = null;
  let end: Position | null = null;
  
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      if (maze[row][col].type === 'start') {
        start = { row, col };
      } else if (maze[row][col].type === 'end') {
        end = { row, col };
      }
    }
  }
  
  if (!start || !end) {
    return false;
  }
  
  const path = findPath(maze, start, end);
  return path !== null && path.length > 0;
}

/**
 * Count all possible paths from start to end (for debugging)
 */
function countAllPaths(
  maze: MazeCell[][], 
  start: Position, 
  end: Position
): number {
  let pathCount = 0;
  const visited = new Set<string>();
  
  function dfs(current: Position): void {
    const key = `${current.row},${current.col}`;
    
    // Reached the end
    if (current.row === end.row && current.col === end.col) {
      pathCount++;
      return;
    }
    
    // Mark as visited
    visited.add(key);
    
    // Try all directions
    const neighbors = [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 }
    ];
    
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      
      // Check if valid and unvisited
      if (neighbor.row >= 0 && neighbor.row < maze.length &&
          neighbor.col >= 0 && neighbor.col < maze[0].length &&
          maze[neighbor.row][neighbor.col].type !== 'wall' &&
          !visited.has(neighborKey)) {
        dfs(neighbor);
      }
    }
    
    // Backtrack
    visited.delete(key);
  }
  
  dfs(start);
  return pathCount;
}

export function coordinatesToKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function keyToCoordinates(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}