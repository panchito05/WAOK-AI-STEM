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
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

// Array of directions for iteration
const DIRECTION_KEYS: Direction[] = ['up', 'down', 'left', 'right'];

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
  
  // Initialize maze with all walls
  const maze: MazeCell[][] = Array(gridSize).fill(null).map((_, row) =>
    Array(gridSize).fill(null).map((_, col) => ({
      row,
      col,
      type: 'wall' as MazeCellType,
      visited: false
    }))
  );
  
  console.log('Initialized maze grid:', gridSize, 'x', gridSize);

  // Generate the maze structure
  generateMazeStructure(maze, gridSize, pathComplexity);
  
  // Set start and end positions
  const start: Position = { row: 1, col: 1 };
  const end: Position = { row: gridSize - 2, col: gridSize - 2 };
  
  maze[start.row][start.col].type = 'start';
  maze[end.row][end.col].type = 'end';
  
  // Find the optimal solution
  const solution = findPath(maze, start, end) || [];
  
  return { maze, solution };
}

/**
 * Generates maze structure using Recursive Backtracking
 */
function generateMazeStructure(
  maze: MazeCell[][], 
  gridSize: number,
  pathComplexity: number
): void {
  console.log('Starting maze generation with grid size:', gridSize);
  
  // For even-sized grids, we need to ensure we work with odd coordinates
  // This ensures proper wall/path alternation
  const adjustedSize = gridSize % 2 === 0 ? gridSize - 1 : gridSize;
  
  // Stack for backtracking
  const stack: Position[] = [];
  
  // Start from an odd coordinate (1, 1) to ensure proper maze structure
  const start: Position = { row: 1, col: 1 };
  maze[start.row][start.col].type = 'empty';
  maze[start.row][start.col].visited = true;
  stack.push(start);
  
  let cellsCarved = 1;
  let wallsRemoved = 0;
  
  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const unvisitedNeighbors = getUnvisitedNeighbors(maze, current, adjustedSize);
    
    if (unvisitedNeighbors.length > 0) {
      // Shuffle neighbors for randomness
      shuffleArray(unvisitedNeighbors);
      
      // Choose based on difficulty (more complex = less predictable)
      const index = pathComplexity > 0.7 ? 0 : Math.floor(Math.random() * Math.min(2, unvisitedNeighbors.length));
      const next = unvisitedNeighbors[index];
      
      // Remove wall between current and next
      removeWallBetween(maze, current, next);
      wallsRemoved++;
      
      // Mark as visited and continue
      maze[next.row][next.col].type = 'empty';
      maze[next.row][next.col].visited = true;
      stack.push(next);
      cellsCarved++;
    } else {
      // Backtrack
      stack.pop();
    }
  }
  
  console.log('Maze generation complete:');
  console.log('- Cells carved:', cellsCarved);
  console.log('- Walls removed:', wallsRemoved);
  console.log('- Stack max depth:', cellsCarved);
  
  // Ensure all odd-positioned cells that should be paths are cleared
  for (let row = 1; row < adjustedSize; row += 2) {
    for (let col = 1; col < adjustedSize; col += 2) {
      if (row < gridSize && col < gridSize && maze[row][col].visited) {
        maze[row][col].type = 'empty';
      }
    }
  }
  
  // Add some additional paths based on difficulty
  addAdditionalPaths(maze, gridSize, pathComplexity);
  
  // Debug: Print maze structure
  if (gridSize <= 15) {
    printMazeDebug(maze);
  }
}

/**
 * Gets unvisited neighbors that are 2 cells away (for maze generation)
 */
function getUnvisitedNeighbors(
  maze: MazeCell[][],
  pos: Position,
  adjustedSize: number
): Position[] {
  const neighbors: Position[] = [];
  const gridSize = maze.length;
  
  for (const dir of DIRECTION_KEYS) {
    const delta = DIRECTIONS[dir];
    const newRow = pos.row + delta.row * 2;
    const newCol = pos.col + delta.col * 2;
    
    // Ensure we stay within bounds and only visit unvisited cells
    if (
      newRow > 0 && newRow < gridSize - 1 &&
      newCol > 0 && newCol < gridSize - 1 &&
      newRow < adjustedSize && newCol < adjustedSize &&
      maze[newRow][newCol].type === 'wall' && // Still a wall
      !maze[newRow][newCol].visited // Not visited
    ) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
}

/**
 * Removes wall between two positions
 */
function removeWallBetween(maze: MazeCell[][], pos1: Position, pos2: Position): void {
  const midRow = Math.floor((pos1.row + pos2.row) / 2);
  const midCol = Math.floor((pos1.col + pos2.col) / 2);
  maze[midRow][midCol].type = 'empty';
  maze[midRow][midCol].visited = true;
}

/**
 * Adds additional paths to increase complexity based on difficulty
 */
function addAdditionalPaths(
  maze: MazeCell[][],
  gridSize: number,
  pathComplexity: number
): void {
  const additionalPaths = Math.floor(gridSize * gridSize * pathComplexity * 0.02);
  let pathsAdded = 0;
  
  console.log('Attempting to add', additionalPaths, 'additional paths');
  
  for (let i = 0; i < additionalPaths * 3 && pathsAdded < additionalPaths; i++) {
    const row = 1 + Math.floor(Math.random() * (gridSize - 2));
    const col = 1 + Math.floor(Math.random() * (gridSize - 2));
    
    if (maze[row][col].type === 'wall') {
      // Check if removing this wall doesn't break the maze structure
      const adjacentEmpty = countAdjacentEmpty(maze, { row, col });
      if (adjacentEmpty === 2) {
        maze[row][col].type = 'empty';
        pathsAdded++;
      }
    }
  }
  
  console.log('Additional paths added:', pathsAdded);
}

/**
 * Counts adjacent empty cells
 */
function countAdjacentEmpty(maze: MazeCell[][], pos: Position): number {
  let count = 0;
  
  for (const dir of DIRECTION_KEYS) {
    const delta = DIRECTIONS[dir];
    const newRow = pos.row + delta.row;
    const newCol = pos.col + delta.col;
    
    if (maze[newRow]?.[newCol]?.type === 'empty') {
      count++;
    }
  }
  
  return count;
}

/**
 * Finds shortest path using BFS algorithm
 * @param maze - The maze grid
 * @param start - Starting position
 * @param end - Ending position
 * @returns Array of positions forming the shortest path, or null if no path exists
 */
export function findPath(
  maze: MazeCell[][],
  start: Position,
  end: Position
): Position[] | null {
  const queue: { pos: Position; path: Position[] }[] = [];
  const visited = new Set<string>();
  
  queue.push({ pos: start, path: [start] });
  visited.add(positionToKey(start));
  
  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;
    
    // Check if we reached the end
    if (pos.row === end.row && pos.col === end.col) {
      return path;
    }
    
    // Explore neighbors
    const neighbors = getNeighbors(maze, pos);
    
    for (const neighbor of neighbors) {
      const key = positionToKey(neighbor);
      
      if (!visited.has(key) && isValidMove(maze, pos, neighbor)) {
        visited.add(key);
        queue.push({
          pos: neighbor,
          path: [...path, neighbor]
        });
      }
    }
  }
  
  return null;
}

/**
 * Gets all valid neighbor positions
 * @param maze - The maze grid
 * @param position - Current position
 * @returns Array of neighboring positions
 */
export function getNeighbors(maze: MazeCell[][], position: Position): Position[] {
  const neighbors: Position[] = [];
  const gridSize = maze.length;
  
  for (const dir of DIRECTION_KEYS) {
    const delta = DIRECTIONS[dir];
    const newRow = position.row + delta.row;
    const newCol = position.col + delta.col;
    
    if (isWithinBounds(newRow, newCol, gridSize)) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }
  
  return neighbors;
}

/**
 * Checks if a move from one position to another is valid
 * @param maze - The maze grid
 * @param from - Starting position
 * @param to - Target position
 * @returns True if move is valid
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
 * Checks if position is within maze bounds
 */
function isWithinBounds(row: number, col: number, gridSize: number): boolean {
  return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

/**
 * Converts position to string key for Set/Map usage
 */
function positionToKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

/**
 * Gets weighted random index based on path complexity
 */
function getWeightedRandomIndex(length: number, complexity: number): number {
  if (Math.random() > complexity) {
    // Simple selection for easier mazes
    return Math.floor(Math.random() * length);
  } else {
    // Weighted selection for harder mazes (prefer later options)
    const weights = Array(length).fill(0).map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return length - 1;
  }
}

/**
 * Helper function to validate maze has exactly one solution
 */
export function validateMaze(maze: MazeCell[][]): boolean {
  let start: Position | null = null;
  let end: Position | null = null;
  
  // Find start and end positions
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
  
  // Check if path exists
  const path = findPath(maze, start, end);
  return path !== null && path.length > 0;
}

/**
 * Gets available directions from a position
 */
export function getAvailableDirections(
  maze: MazeCell[][],
  position: Position
): Direction[] {
  const available: Direction[] = [];
  
  for (const dir of DIRECTION_KEYS) {
    const delta = DIRECTIONS[dir];
    const newPos: Position = {
      row: position.row + delta.row,
      col: position.col + delta.col
    };
    
    if (isValidMove(maze, position, newPos)) {
      available.push(dir);
    }
  }
  
  return available;
}

/**
 * Converts grid coordinates to cell key
 */
export function coordinatesToKey(row: number, col: number): string {
  return `${row},${col}`;
}

/**
 * Converts cell key to grid coordinates
 */
export function keyToCoordinates(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Debug function to print maze structure
 */
function printMazeDebug(maze: MazeCell[][]): void {
  console.log('\nMaze Structure:');
  let output = '';
  for (let row = 0; row < maze.length; row++) {
    for (let col = 0; col < maze[row].length; col++) {
      const cell = maze[row][col];
      if (cell.type === 'wall') {
        output += '█';
      } else if (cell.type === 'start') {
        output += 'S';
      } else if (cell.type === 'end') {
        output += 'E';
      } else {
        output += ' ';
      }
    }
    output += '\n';
  }
  console.log(output);
}