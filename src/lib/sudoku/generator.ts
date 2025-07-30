import {
  SudokuVariant,
  SudokuDifficulty,
  SudokuCell,
  SudokuGameState,
  SUDOKU_VARIANTS,
  CELLS_TO_REMOVE,
} from './types';

/**
 * Generador de Sudoku optimizado con soporte para múltiples variantes
 * Utiliza técnicas avanzadas de backtracking y validación para garantizar
 * puzzles únicos y resolvibles con lógica
 */

// Cache para almacenar las dimensiones de las cajas según la variante
const BOX_DIMENSIONS: Record<SudokuVariant, { width: number; height: number }> = {
  'classic': { width: 3, height: 3 },
  'dosdoku-4': { width: 2, height: 2 },
  'dosdoku-6': { width: 3, height: 2 }, // 2x3 boxes (2 filas, 3 columnas)
};

/**
 * Genera un tablero de Sudoku completo y válido
 * @param variant - Tipo de sudoku a generar
 * @param difficulty - Nivel de dificultad
 * @returns Tablero completo con números removidos según dificultad
 */
export function generateBoard(
  variant: SudokuVariant,
  difficulty: SudokuDifficulty
): { board: SudokuCell[][]; solution: number[][] } {
  const size = SUDOKU_VARIANTS[variant].size;
  
  // Generar tablero completo
  const solution = generateCompleteSudoku(variant);
  
  // Crear tablero de juego con celdas removidas
  const board = createBoardFromSolution(solution, variant);
  
  // Remover números según dificultad
  const cellsToRemove = CELLS_TO_REMOVE[variant][difficulty];
  removeNumbers(board, cellsToRemove, variant);
  
  return { board, solution };
}

/**
 * Genera un Sudoku completo usando técnica de permutación optimizada
 */
function generateCompleteSudoku(variant: SudokuVariant): number[][] {
  const size = SUDOKU_VARIANTS[variant].size;
  const board: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
  
  // Llenar el tablero usando backtracking con optimizaciones
  fillBoardRecursive(board, variant);
  
  // Aplicar transformaciones aleatorias para mayor variedad
  applyRandomTransformations(board, variant);
  
  return board;
}

/**
 * Llena el tablero recursivamente usando backtracking optimizado
 */
function fillBoardRecursive(board: number[][], variant: SudokuVariant): boolean {
  const size = board.length;
  
  // Encontrar la siguiente celda vacía usando heurística MRV (Minimum Remaining Values)
  const nextCell = findBestEmptyCell(board, variant);
  
  if (!nextCell) {
    return true; // Tablero completo
  }
  
  const { row, col } = nextCell;
  const candidates = getCandidates(board, row, col, variant);
  
  // Aleatorizar candidatos para generar tableros únicos
  shuffleArray(candidates);
  
  for (const num of candidates) {
    if (isValidMove(board, row, col, num, variant)) {
      board[row][col] = num;
      
      if (fillBoardRecursive(board, variant)) {
        return true;
      }
      
      board[row][col] = 0; // Backtrack
    }
  }
  
  return false;
}

/**
 * Encuentra la mejor celda vacía usando heurística MRV
 * Selecciona la celda con menos valores posibles
 */
function findBestEmptyCell(
  board: number[][],
  variant: SudokuVariant
): { row: number; col: number } | null {
  const size = board.length;
  let minCandidates = size + 1;
  let bestCell = null;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        const candidates = getCandidates(board, row, col, variant);
        if (candidates.length < minCandidates) {
          minCandidates = candidates.length;
          bestCell = { row, col };
          
          // Si solo hay un candidato, no buscar más
          if (minCandidates === 1) {
            return bestCell;
          }
        }
      }
    }
  }
  
  return bestCell;
}

/**
 * Obtiene los candidatos válidos para una celda
 */
function getCandidates(
  board: number[][],
  row: number,
  col: number,
  variant: SudokuVariant
): number[] {
  const size = board.length;
  const candidates: number[] = [];
  
  for (let num = 1; num <= size; num++) {
    if (isValidMove(board, row, col, num, variant)) {
      candidates.push(num);
    }
  }
  
  return candidates;
}

/**
 * Valida si un movimiento es legal según las reglas del Sudoku
 */
export function isValidMove(
  board: number[][] | SudokuCell[][],
  row: number,
  col: number,
  num: number,
  variant: SudokuVariant
): boolean {
  const size = SUDOKU_VARIANTS[variant].size;
  
  // Obtener el valor actual del tablero
  const getValue = (r: number, c: number): number => {
    const cell = board[r][c];
    return typeof cell === 'number' ? cell : (cell.value || 0);
  };
  
  // Verificar fila
  for (let c = 0; c < size; c++) {
    if (c !== col && getValue(row, c) === num) {
      return false;
    }
  }
  
  // Verificar columna
  for (let r = 0; r < size; r++) {
    if (r !== row && getValue(r, col) === num) {
      return false;
    }
  }
  
  // Verificar caja
  const { width, height } = BOX_DIMENSIONS[variant];
  const boxStartRow = Math.floor(row / height) * height;
  const boxStartCol = Math.floor(col / width) * width;
  
  for (let r = boxStartRow; r < boxStartRow + height; r++) {
    for (let c = boxStartCol; c < boxStartCol + width; c++) {
      if (r !== row && c !== col && getValue(r, c) === num) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Aplica transformaciones aleatorias al tablero para mayor variedad
 */
function applyRandomTransformations(board: number[][], variant: SudokuVariant): void {
  const transformations = [
    () => rotateBoard(board),
    () => reflectHorizontal(board),
    () => reflectVertical(board),
    () => swapRowsInSameBox(board, variant),
    () => swapColsInSameBox(board, variant),
    () => swapBoxRows(board, variant),
    () => swapBoxCols(board, variant),
  ];
  
  // Aplicar 2-4 transformaciones aleatorias
  const numTransformations = Math.floor(Math.random() * 3) + 2;
  
  for (let i = 0; i < numTransformations; i++) {
    const transform = transformations[Math.floor(Math.random() * transformations.length)];
    transform();
  }
}

/**
 * Rota el tablero 90 grados
 */
function rotateBoard(board: number[][]): void {
  const n = board.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    for (let j = i; j < n - i - 1; j++) {
      const temp = board[i][j];
      board[i][j] = board[n - 1 - j][i];
      board[n - 1 - j][i] = board[n - 1 - i][n - 1 - j];
      board[n - 1 - i][n - 1 - j] = board[j][n - 1 - i];
      board[j][n - 1 - i] = temp;
    }
  }
}

/**
 * Refleja el tablero horizontalmente
 */
function reflectHorizontal(board: number[][]): void {
  const n = board.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    [board[i], board[n - 1 - i]] = [board[n - 1 - i], board[i]];
  }
}

/**
 * Refleja el tablero verticalmente
 */
function reflectVertical(board: number[][]): void {
  const n = board.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < Math.floor(n / 2); j++) {
      [board[i][j], board[i][n - 1 - j]] = [board[i][n - 1 - j], board[i][j]];
    }
  }
}

/**
 * Intercambia filas dentro de la misma caja
 */
function swapRowsInSameBox(board: number[][], variant: SudokuVariant): void {
  const { height } = BOX_DIMENSIONS[variant];
  const numBoxes = Math.floor(board.length / height);
  const boxIndex = Math.floor(Math.random() * numBoxes);
  const boxStart = boxIndex * height;
  
  if (height > 1) {
    const row1 = Math.floor(Math.random() * height);
    let row2 = Math.floor(Math.random() * height);
    while (row2 === row1) {
      row2 = Math.floor(Math.random() * height);
    }
    
    [board[boxStart + row1], board[boxStart + row2]] = 
    [board[boxStart + row2], board[boxStart + row1]];
  }
}

/**
 * Intercambia columnas dentro de la misma caja
 */
function swapColsInSameBox(board: number[][], variant: SudokuVariant): void {
  const { width } = BOX_DIMENSIONS[variant];
  const numBoxes = Math.floor(board.length / width);
  const boxIndex = Math.floor(Math.random() * numBoxes);
  const boxStart = boxIndex * width;
  
  if (width > 1) {
    const col1 = Math.floor(Math.random() * width);
    let col2 = Math.floor(Math.random() * width);
    while (col2 === col1) {
      col2 = Math.floor(Math.random() * width);
    }
    
    for (let row = 0; row < board.length; row++) {
      [board[row][boxStart + col1], board[row][boxStart + col2]] = 
      [board[row][boxStart + col2], board[row][boxStart + col1]];
    }
  }
}

/**
 * Intercambia grupos de filas de cajas
 */
function swapBoxRows(board: number[][], variant: SudokuVariant): void {
  const { height } = BOX_DIMENSIONS[variant];
  const numBoxRows = Math.floor(board.length / height);
  
  if (numBoxRows > 1) {
    const box1 = Math.floor(Math.random() * numBoxRows);
    let box2 = Math.floor(Math.random() * numBoxRows);
    while (box2 === box1) {
      box2 = Math.floor(Math.random() * numBoxRows);
    }
    
    for (let i = 0; i < height; i++) {
      [board[box1 * height + i], board[box2 * height + i]] = 
      [board[box2 * height + i], board[box1 * height + i]];
    }
  }
}

/**
 * Intercambia grupos de columnas de cajas
 */
function swapBoxCols(board: number[][], variant: SudokuVariant): void {
  const { width } = BOX_DIMENSIONS[variant];
  const numBoxCols = Math.floor(board.length / width);
  
  if (numBoxCols > 1) {
    const box1 = Math.floor(Math.random() * numBoxCols);
    let box2 = Math.floor(Math.random() * numBoxCols);
    while (box2 === box1) {
      box2 = Math.floor(Math.random() * numBoxCols);
    }
    
    for (let row = 0; row < board.length; row++) {
      for (let i = 0; i < width; i++) {
        [board[row][box1 * width + i], board[row][box2 * width + i]] = 
        [board[row][box2 * width + i], board[row][box1 * width + i]];
      }
    }
  }
}

/**
 * Crea un tablero de SudokuCell a partir de la solución
 */
function createBoardFromSolution(
  solution: number[][],
  variant: SudokuVariant
): SudokuCell[][] {
  const size = solution.length;
  const board: SudokuCell[][] = [];
  
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      board[row][col] = {
        value: solution[row][col],
        isPreFilled: true,
        isValid: true,
        notes: [],
        row,
        col,
      };
    }
  }
  
  return board;
}

/**
 * Quita números del tablero garantizando una solución única
 * Utiliza técnicas de simetría y validación para crear puzzles balanceados
 */
export function removeNumbers(
  board: SudokuCell[][],
  cellsToRemove: number,
  variant: SudokuVariant
): void {
  const size = board.length;
  const totalCells = size * size;
  const cellsToKeep = totalCells - cellsToRemove;
  
  // Crear lista de todas las celdas
  const cells: { row: number; col: number }[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      cells.push({ row, col });
    }
  }
  
  // Aleatorizar orden de las celdas
  shuffleArray(cells);
  
  let removed = 0;
  const removedCells: { row: number; col: number; value: number }[] = [];
  
  // Intentar remover celdas manteniendo solución única
  for (const { row, col } of cells) {
    if (removed >= cellsToRemove) break;
    
    const originalValue = board[row][col].value;
    if (!originalValue) continue;
    
    // Temporalmente remover el valor
    board[row][col].value = null;
    board[row][col].isPreFilled = false;
    
    // Verificar si el puzzle sigue teniendo solución única
    if (hasUniqueSolution(boardToNumbers(board), variant)) {
      removed++;
      removedCells.push({ row, col, value: originalValue });
      
      // Para mayor simetría, intentar remover la celda simétrica
      const symRow = size - 1 - row;
      const symCol = size - 1 - col;
      
      if (removed < cellsToRemove && board[symRow][symCol].value !== null) {
        const symValue = board[symRow][symCol].value;
        board[symRow][symCol].value = null;
        board[symRow][symCol].isPreFilled = false;
        
        if (hasUniqueSolution(boardToNumbers(board), variant)) {
          removed++;
          removedCells.push({ row: symRow, col: symCol, value: symValue! });
        } else {
          // Restaurar si no mantiene solución única
          board[symRow][symCol].value = symValue;
          board[symRow][symCol].isPreFilled = true;
        }
      }
    } else {
      // Restaurar el valor si no mantiene solución única
      board[row][col].value = originalValue;
      board[row][col].isPreFilled = true;
    }
  }
  
  // Si no se pudieron remover suficientes celdas con validación estricta,
  // usar un enfoque más agresivo pero manteniendo dificultad adecuada
  if (removed < cellsToRemove) {
    const additionalRemovals = Math.min(cellsToRemove - removed, 5);
    for (let i = 0; i < additionalRemovals && removed < cellsToRemove; i++) {
      const candidates = cells.filter(({ row, col }) => 
        board[row][col].value !== null && !board[row][col].isPreFilled
      );
      
      if (candidates.length > 0) {
        const { row, col } = candidates[Math.floor(Math.random() * candidates.length)];
        board[row][col].value = null;
        board[row][col].isPreFilled = false;
        removed++;
      }
    }
  }
}

/**
 * Convierte un tablero de SudokuCell a números
 */
function boardToNumbers(board: SudokuCell[][]): number[][] {
  return board.map(row => 
    row.map(cell => cell.value || 0)
  );
}

/**
 * Verifica que el puzzle tenga exactamente una solución
 * Utiliza técnicas de conteo de soluciones con corte temprano
 */
export function hasUniqueSolution(board: number[][], variant: SudokuVariant): boolean {
  const boardCopy = board.map(row => [...row]);
  let solutionCount = 0;
  
  function countSolutions(board: number[][]): boolean {
    const emptyCell = findFirstEmptyCell(board);
    
    if (!emptyCell) {
      solutionCount++;
      return solutionCount > 1; // Cortar si hay más de una solución
    }
    
    const { row, col } = emptyCell;
    const candidates = getCandidates(board, row, col, variant);
    
    for (const num of candidates) {
      board[row][col] = num;
      
      if (countSolutions(board)) {
        return true; // Más de una solución encontrada
      }
      
      board[row][col] = 0;
    }
    
    return false;
  }
  
  countSolutions(boardCopy);
  return solutionCount === 1;
}

/**
 * Encuentra la primera celda vacía (sin optimización MRV)
 */
function findFirstEmptyCell(board: number[][]): { row: number; col: number } | null {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === 0) {
        return { row, col };
      }
    }
  }
  return null;
}

/**
 * Resuelve un tablero de Sudoku usando técnicas avanzadas
 * Combina lógica humana con backtracking cuando es necesario
 */
export function solveBoard(board: number[][], variant: SudokuVariant): number[][] | null {
  const boardCopy = board.map(row => [...row]);
  
  // Primero intentar resolver con técnicas lógicas
  let progress = true;
  while (progress) {
    progress = false;
    
    // Aplicar técnica de "naked singles"
    if (applyNakedSingles(boardCopy, variant)) {
      progress = true;
    }
    
    // Aplicar técnica de "hidden singles"
    if (applyHiddenSingles(boardCopy, variant)) {
      progress = true;
    }
  }
  
  // Si no está completo, usar backtracking
  if (solveBoardRecursive(boardCopy, variant)) {
    return boardCopy;
  }
  
  return null;
}

/**
 * Aplica la técnica de "naked singles"
 * Busca celdas que solo tienen un candidato posible
 */
function applyNakedSingles(board: number[][], variant: SudokuVariant): boolean {
  let found = false;
  const size = board.length;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] === 0) {
        const candidates = getCandidates(board, row, col, variant);
        if (candidates.length === 1) {
          board[row][col] = candidates[0];
          found = true;
        }
      }
    }
  }
  
  return found;
}

/**
 * Aplica la técnica de "hidden singles"
 * Busca números que solo pueden ir en una posición dentro de una unidad
 */
function applyHiddenSingles(board: number[][], variant: SudokuVariant): boolean {
  let found = false;
  const size = board.length;
  
  // Verificar filas
  for (let row = 0; row < size; row++) {
    for (let num = 1; num <= size; num++) {
      const positions = [];
      for (let col = 0; col < size; col++) {
        if (board[row][col] === 0 && isValidMove(board, row, col, num, variant)) {
          positions.push(col);
        }
      }
      if (positions.length === 1) {
        board[row][positions[0]] = num;
        found = true;
      }
    }
  }
  
  // Verificar columnas
  for (let col = 0; col < size; col++) {
    for (let num = 1; num <= size; num++) {
      const positions = [];
      for (let row = 0; row < size; row++) {
        if (board[row][col] === 0 && isValidMove(board, row, col, num, variant)) {
          positions.push(row);
        }
      }
      if (positions.length === 1) {
        board[positions[0]][col] = num;
        found = true;
      }
    }
  }
  
  // Verificar cajas
  const { width, height } = BOX_DIMENSIONS[variant];
  const boxesPerRow = Math.floor(size / height);
  const boxesPerCol = Math.floor(size / width);
  
  for (let boxRow = 0; boxRow < boxesPerRow; boxRow++) {
    for (let boxCol = 0; boxCol < boxesPerCol; boxCol++) {
      const startRow = boxRow * height;
      const startCol = boxCol * width;
      
      for (let num = 1; num <= size; num++) {
        const positions = [];
        for (let r = startRow; r < startRow + height; r++) {
          for (let c = startCol; c < startCol + width; c++) {
            if (board[r][c] === 0 && isValidMove(board, r, c, num, variant)) {
              positions.push({ row: r, col: c });
            }
          }
        }
        if (positions.length === 1) {
          board[positions[0].row][positions[0].col] = num;
          found = true;
        }
      }
    }
  }
  
  return found;
}

/**
 * Resuelve el tablero recursivamente usando backtracking
 */
function solveBoardRecursive(board: number[][], variant: SudokuVariant): boolean {
  const emptyCell = findBestEmptyCell(board, variant);
  
  if (!emptyCell) {
    return true; // Tablero completo
  }
  
  const { row, col } = emptyCell;
  const candidates = getCandidates(board, row, col, variant);
  
  for (const num of candidates) {
    board[row][col] = num;
    
    if (solveBoardRecursive(board, variant)) {
      return true;
    }
    
    board[row][col] = 0; // Backtrack
  }
  
  return false;
}

/**
 * Devuelve una pista mostrando la siguiente mejor jugada
 * Prioriza celdas con un solo candidato o técnicas lógicas simples
 */
export function getHint(gameState: SudokuGameState): { row: number; col: number; value: number } | null {
  const board = gameState.board;
  const solution = gameState.solution;
  
  // Validar que tenemos una solución
  if (!solution || !board || board.length === 0) {
    console.error('getHint: Invalid gameState - missing solution or board');
    return null;
  }
  
  const size = board.length;
  
  // Buscar celdas vacías con errores
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (cell.value !== null && !cell.isPreFilled && cell.value !== solution[row][col]) {
        return { row, col, value: solution[row][col] };
      }
    }
  }
  
  // Buscar naked singles (celdas con un solo candidato)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].value === null) {
        const numBoard = boardToNumbers(board);
        const candidates = getCandidates(numBoard, row, col, gameState.variant);
        
        if (candidates.length === 1) {
          return { row, col, value: candidates[0] };
        }
      }
    }
  }
  
  // Buscar hidden singles en filas
  for (let row = 0; row < size; row++) {
    for (let num = 1; num <= size; num++) {
      const positions = [];
      for (let col = 0; col < size; col++) {
        if (board[row][col].value === null) {
          const numBoard = boardToNumbers(board);
          if (isValidMove(numBoard, row, col, num, gameState.variant)) {
            positions.push(col);
          }
        }
      }
      if (positions.length === 1) {
        return { row, col: positions[0], value: num };
      }
    }
  }
  
  // Si no hay movimientos lógicos obvios, dar una celda aleatoria correcta
  const emptyCells = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].value === null) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return { row, col, value: solution[row][col] };
  }
  
  return null;
}

/**
 * Función auxiliar para mezclar un array
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}