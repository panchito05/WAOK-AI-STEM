'use client';

import React from 'react';
import { MazeGameState } from '@/lib/maze/types';

interface MazeDebugProps {
  gameState: MazeGameState | null;
}

export function MazeDebug({ gameState }: MazeDebugProps) {
  if (!gameState) return null;

  // Create a hash of the maze structure to detect changes
  const mazeHash = gameState.maze
    .flat()
    .map(cell => `${cell.row},${cell.col}:${cell.type}`)
    .join('|');

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <h3 className="font-bold mb-2">Maze Debug Info</h3>
      <div className="space-y-1">
        <div>Size: {gameState.size} ({gameState.maze.length}x{gameState.maze.length})</div>
        <div>Difficulty: {gameState.difficulty}</div>
        <div>Moves: {gameState.moveCount}</div>
        <div>Hints: {gameState.hintsUsed}/{gameState.config.maxHints}</div>
        <div>Solution showing: {gameState.showingSolution ? 'Yes' : 'No'}</div>
        <div className="break-all">
          Maze ID: {gameState.id}
        </div>
        <div className="break-all">
          Structure Hash: {mazeHash.substring(0, 50)}...
        </div>
        <div className="text-yellow-300">
          Watch this hash - it should NEVER change during gameplay!
        </div>
      </div>
    </div>
  );
}