import { MazeCell } from './types';

/**
 * Creates a deep clone of a maze array to prevent mutations
 * @param maze - The maze array to clone
 * @returns A new maze array with all cells cloned
 */
export function cloneMaze(maze: MazeCell[][]): MazeCell[][] {
  return maze.map(row => 
    row.map(cell => ({
      ...cell,
      // Ensure all properties are copied
      row: cell.row,
      col: cell.col,
      type: cell.type,
      visited: cell.visited,
      isPath: cell.isPath || false,
      isHint: cell.isHint || false
    }))
  );
}

/**
 * Updates specific cells in the maze without mutation
 * @param maze - The original maze
 * @param updates - Map of "row,col" -> cell updates
 * @returns A new maze with the updates applied
 */
export function updateMazeCells(
  maze: MazeCell[][], 
  updates: Map<string, Partial<MazeCell>>
): MazeCell[][] {
  return maze.map((row, rowIndex) => 
    row.map((cell, colIndex) => {
      const key = `${rowIndex},${colIndex}`;
      const update = updates.get(key);
      
      if (update) {
        return {
          ...cell,
          ...update
        };
      }
      
      return cell;
    })
  );
}

/**
 * Clears specific properties from all cells in the maze
 * @param maze - The original maze
 * @param properties - Properties to clear/reset
 * @returns A new maze with properties cleared
 */
export function clearMazeProperties(
  maze: MazeCell[][], 
  properties: (keyof MazeCell)[]
): MazeCell[][] {
  return maze.map(row => 
    row.map(cell => {
      const newCell = { ...cell };
      
      properties.forEach(prop => {
        if (prop === 'isPath' || prop === 'isHint') {
          newCell[prop] = false;
        }
      });
      
      return newCell;
    })
  );
}