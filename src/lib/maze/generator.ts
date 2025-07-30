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
  
  // Add complexity based on difficulty
  if (pathComplexity > 0.5) {
    addComplexity(finalMaze, gridSize, pathComplexity);
  }
  
  // Debug print for small mazes
  if (gridSize <= 15) {
    printMaze(finalMaze);
  }
  
  // Find the optimal solution
  const solution = findPath(finalMaze, start, end) || [];
  
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
 * Add complexity to the maze by removing some walls
 */
function addComplexity(maze: MazeCell[][], size: number, complexity: number): void {
  let removed = 0; // Declare at function scope
  
  // For high complexity (difficulty > 0.9), create many loops and dead ends
  if (complexity > 0.9) {
    const wallsToRemove = Math.floor(size * size * 0.15); // Remove 15% of walls for very complex maze
    
    // First pass: Create multiple loops by removing walls between paths
    for (let attempts = 0; attempts < wallsToRemove * 20 && removed < wallsToRemove; attempts++) {
      const row = 1 + Math.floor(Math.random() * (size - 2));
      const col = 1 + Math.floor(Math.random() * (size - 2));
      
      if (maze[row][col].type === 'wall') {
        // Check if this wall is between two empty cells (creates loops)
        const horizontalPath = row > 0 && row < size - 1 && 
          maze[row - 1][col].type !== 'wall' && 
          maze[row + 1][col].type !== 'wall';
        const verticalPath = col > 0 && col < size - 1 && 
          maze[row][col - 1].type !== 'wall' && 
          maze[row][col + 1].type !== 'wall';
        
        if (horizontalPath || verticalPath) {
          maze[row][col].type = 'empty';
          removed++;
        }
      }
    }
    
    // Second pass: Create dead-end branches
    const branches = Math.floor(size * complexity * 0.5);
    for (let i = 0; i < branches; i++) {
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
        
        // Create dead-end branch if only one adjacent path
        if (emptyCount === 1) {
          maze[row][col].type = 'empty';
          
          // Extend the branch randomly
          let branchLength = Math.floor(Math.random() * 3) + 1;
          let currentRow = row;
          let currentCol = col;
          
          for (let j = 0; j < branchLength; j++) {
            const directions = shuffleArray([...DIRECTION_KEYS]);
            let extended = false;
            
            for (const dir of directions) {
              const delta = DIRECTIONS[dir];
              const nextRow = currentRow + delta.row / 2; // Use step of 1 for branches
              const nextCol = currentCol + delta.col / 2;
              
              if (nextRow > 0 && nextRow < size - 1 && 
                  nextCol > 0 && nextCol < size - 1 &&
                  maze[nextRow][nextCol].type === 'wall') {
                
                // Check if we can extend without creating loops
                let adjacentPaths = 0;
                for (const n of neighbors) {
                  const checkRow = nextRow + n.r - row;
                  const checkCol = nextCol + n.c - col;
                  if (checkRow >= 0 && checkRow < size && checkCol >= 0 && checkCol < size) {
                    if (maze[checkRow][checkCol].type !== 'wall') {
                      adjacentPaths++;
                    }
                  }
                }
                
                if (adjacentPaths <= 1) {
                  maze[nextRow][nextCol].type = 'empty';
                  currentRow = nextRow;
                  currentCol = nextCol;
                  extended = true;
                  break;
                }
              }
            }
            
            if (!extended) break;
          }
        }
      }
    }
  } else {
    // Original complexity for easier difficulties
    const wallsToRemove = Math.floor(size * complexity);
    
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
        
        // Only remove if it connects exactly 2 empty cells
        if (emptyCount === 2) {
          maze[row][col].type = 'empty';
          removed++;
        }
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

export function coordinatesToKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function keyToCoordinates(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}