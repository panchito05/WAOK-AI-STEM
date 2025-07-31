import { Player, BoardSize, AIDifficulty } from './types';
import { 
  makeMove, 
  checkWinner, 
  getAvailableMoves, 
  switchPlayer,
  isBoardFull,
  evaluatePosition
} from './generator';

interface MinimaxResult {
  score: number;
  move?: { row: number; col: number };
}

export function getAIMove(
  board: Player[][],
  aiPlayer: Player,
  difficulty: AIDifficulty
): { row: number; col: number } | null {
  const availableMoves = getAvailableMoves(board);
  
  if (availableMoves.length === 0) return null;
  
  if (difficulty === 'easy') {
    // IA fácil: 70% movimiento aleatorio, 30% mejor movimiento
    if (Math.random() < 0.7) {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
  }
  
  // IA difícil o el 30% de la IA fácil: usar minimax
  const depth = difficulty === 'hard' ? getOptimalDepth(board.length as BoardSize) : 2;
  const result = minimax(board, depth, true, aiPlayer, -Infinity, Infinity);
  
  return result.move || availableMoves[0];
}

function getOptimalDepth(boardSize: BoardSize): number {
  // Ajustar profundidad según el tamaño del tablero para mantener buen rendimiento
  switch (boardSize) {
    case 3: return 9;  // Puede explorar todo el árbol
    case 4: return 5;  // Limitar para rendimiento
    case 5: return 3;  // Limitar más para tableros grandes
    default: return 5;
  }
}

function minimax(
  board: Player[][],
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number,
  beta: number
): MinimaxResult {
  const humanPlayer = switchPlayer(aiPlayer);
  const { winner } = checkWinner(board);
  
  // Casos base
  if (winner === aiPlayer) {
    return { score: 10 + depth }; // Preferir victorias más rápidas
  }
  if (winner === humanPlayer) {
    return { score: -10 - depth }; // Evitar derrotas rápidas
  }
  if (depth === 0 || isBoardFull(board)) {
    return { score: evaluateBoard(board, aiPlayer) };
  }
  
  const availableMoves = getAvailableMoves(board);
  let bestMove = availableMoves[0];
  
  if (isMaximizing) {
    let maxScore = -Infinity;
    
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move.row, move.col, aiPlayer);
      const result = minimax(newBoard, depth - 1, false, aiPlayer, alpha, beta);
      
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) break; // Poda alfa-beta
    }
    
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    
    for (const move of availableMoves) {
      const newBoard = makeMove(board, move.row, move.col, humanPlayer);
      const result = minimax(newBoard, depth - 1, true, aiPlayer, alpha, beta);
      
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      
      beta = Math.min(beta, minScore);
      if (beta <= alpha) break; // Poda alfa-beta
    }
    
    return { score: minScore, move: bestMove };
  }
}

function evaluateBoard(board: Player[][], aiPlayer: Player): number {
  const humanPlayer = switchPlayer(aiPlayer);
  let score = 0;
  
  // Evaluar cada línea posible
  const lines = getAllLines(board);
  
  for (const line of lines) {
    const lineScore = evaluateLine(line, aiPlayer, humanPlayer);
    score += lineScore;
  }
  
  // Bonificación por control del centro (especialmente importante en tableros más grandes)
  const centerIndex = Math.floor(board.length / 2);
  if (board[centerIndex][centerIndex] === aiPlayer) {
    score += 3;
  }
  
  return score;
}

function getAllLines(board: Player[][]): Player[][] {
  const size = board.length;
  const lines: Player[][] = [];
  
  // Filas
  for (let row = 0; row < size; row++) {
    lines.push(board[row]);
  }
  
  // Columnas
  for (let col = 0; col < size; col++) {
    lines.push(board.map(row => row[col]));
  }
  
  // Diagonal principal
  lines.push(board.map((row, i) => row[i]));
  
  // Diagonal secundaria
  lines.push(board.map((row, i) => row[size - 1 - i]));
  
  return lines;
}

function evaluateLine(line: Player[], aiPlayer: Player, humanPlayer: Player): number {
  const aiCount = line.filter(cell => cell === aiPlayer).length;
  const humanCount = line.filter(cell => cell === humanPlayer).length;
  const emptyCount = line.filter(cell => cell === null).length;
  
  // Si la línea tiene ambos jugadores, no puede ganar nadie
  if (aiCount > 0 && humanCount > 0) return 0;
  
  // Evaluar potencial de la línea
  if (aiCount > 0) {
    // Más valor a líneas casi completas
    if (aiCount === line.length - 1 && emptyCount === 1) return 5;
    if (aiCount === line.length - 2 && emptyCount === 2) return 2;
    return 1;
  }
  
  if (humanCount > 0) {
    // Penalizar líneas del oponente
    if (humanCount === line.length - 1 && emptyCount === 1) return -5;
    if (humanCount === line.length - 2 && emptyCount === 2) return -2;
    return -1;
  }
  
  return 0; // Línea vacía
}

// Función para obtener una jugada de apertura inteligente
export function getOpeningMove(board: Player[][], boardSize: BoardSize): { row: number; col: number } | null {
  const center = Math.floor(boardSize / 2);
  
  // Si el centro está libre, tomarlo
  if (board[center][center] === null) {
    return { row: center, col: center };
  }
  
  // Si no, tomar una esquina
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: boardSize - 1 },
    { row: boardSize - 1, col: 0 },
    { row: boardSize - 1, col: boardSize - 1 }
  ];
  
  const availableCorners = corners.filter(corner => board[corner.row][corner.col] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }
  
  return null;
}