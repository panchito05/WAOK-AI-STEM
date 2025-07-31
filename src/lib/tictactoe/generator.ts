import { Player, BoardSize, Cell, TicTacToeGameState } from './types';

export function createEmptyBoard(size: BoardSize): Player[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

export function isValidMove(board: Player[][], row: number, col: number): boolean {
  return board[row][col] === null;
}

export function makeMove(
  board: Player[][],
  row: number,
  col: number,
  player: Player
): Player[][] {
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = player;
  return newBoard;
}

export function checkWinner(board: Player[][], lastMove?: { row: number; col: number }): {
  winner: Player;
  winningLine: Cell[] | null;
} {
  const size = board.length;
  
  // Verificar filas
  for (let row = 0; row < size; row++) {
    const firstCell = board[row][0];
    if (firstCell && board[row].every(cell => cell === firstCell)) {
      return {
        winner: firstCell,
        winningLine: Array.from({ length: size }, (_, col) => ({ row, col, value: firstCell }))
      };
    }
  }
  
  // Verificar columnas
  for (let col = 0; col < size; col++) {
    const firstCell = board[0][col];
    if (firstCell && board.every(row => row[col] === firstCell)) {
      return {
        winner: firstCell,
        winningLine: Array.from({ length: size }, (_, row) => ({ row, col, value: firstCell }))
      };
    }
  }
  
  // Verificar diagonal principal
  const firstDiagonal = board[0][0];
  if (firstDiagonal && board.every((row, i) => row[i] === firstDiagonal)) {
    return {
      winner: firstDiagonal,
      winningLine: Array.from({ length: size }, (_, i) => ({ row: i, col: i, value: firstDiagonal }))
    };
  }
  
  // Verificar diagonal secundaria
  const firstAntiDiagonal = board[0][size - 1];
  if (firstAntiDiagonal && board.every((row, i) => row[size - 1 - i] === firstAntiDiagonal)) {
    return {
      winner: firstAntiDiagonal,
      winningLine: Array.from({ length: size }, (_, i) => ({ 
        row: i, 
        col: size - 1 - i, 
        value: firstAntiDiagonal 
      }))
    };
  }
  
  return { winner: null, winningLine: null };
}

export function isBoardFull(board: Player[][]): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

export function getAvailableMoves(board: Player[][]): { row: number; col: number }[] {
  const moves: { row: number; col: number }[] = [];
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] === null) {
        moves.push({ row, col });
      }
    }
  }
  
  return moves;
}

export function switchPlayer(currentPlayer: Player): Player {
  return currentPlayer === 'X' ? 'O' : 'X';
}

export function getWinCondition(boardSize: BoardSize): number {
  // Para tableros más grandes, podríamos ajustar esto
  // Por ahora, siempre es el tamaño completo
  return boardSize;
}

export function evaluatePosition(board: Player[][], player: Player): number {
  const { winner } = checkWinner(board);
  
  if (winner === player) return 1;
  if (winner && winner !== player) return -1;
  
  return 0; // Empate o juego en curso
}

export function countWinningLines(board: Player[][], player: Player): number {
  const size = board.length;
  let count = 0;
  
  // Contar líneas potenciales de victoria
  // Filas
  for (let row = 0; row < size; row++) {
    if (board[row].every(cell => cell === player || cell === null)) {
      count++;
    }
  }
  
  // Columnas
  for (let col = 0; col < size; col++) {
    if (board.every(row => row[col] === player || row[col] === null)) {
      count++;
    }
  }
  
  // Diagonal principal
  if (board.every((row, i) => row[i] === player || row[i] === null)) {
    count++;
  }
  
  // Diagonal secundaria
  if (board.every((row, i) => row[size - 1 - i] === player || row[size - 1 - i] === null)) {
    count++;
  }
  
  return count;
}