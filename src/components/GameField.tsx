import React, { useRef, useEffect } from 'react';
import type { Player } from '../services/supabase';

interface GameFieldProps {
  players: Player[];
  currentPlayerId: string | null;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const VISUAL_PLAYER_SIZE = 4; // Player is 1x1 logical, 4x4 visual

const GameField: React.FC<GameFieldProps> = ({ players, currentPlayerId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas
    context.fillStyle = '#222'; // Dark background
    context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw players
    players.forEach((player) => {
      context.fillStyle = player.color;
      context.fillRect(
        player.x * VISUAL_PLAYER_SIZE, // Scale logical position to visual
        player.y * VISUAL_PLAYER_SIZE,
        VISUAL_PLAYER_SIZE,
        VISUAL_PLAYER_SIZE
      );

      // Draw player name label
      if (player.name) {
        context.font = '10px Arial';
        context.textAlign = 'center';
        // Slightly different color for current player's name for visibility
        context.fillStyle = player.id === currentPlayerId ? '#FFF' : '#AAA'; 
        context.fillText(
          player.name,
          player.x * VISUAL_PLAYER_SIZE + VISUAL_PLAYER_SIZE / 2,
          player.y * VISUAL_PLAYER_SIZE - 5 // Position label above the square
        );
      }
    });
  }, [players, currentPlayerId]);

  return (
    <canvas
      ref={canvasRef}
      width={GAME_WIDTH}
      height={GAME_HEIGHT}
      className="border border-gray-700"
    />
  );
};

export default GameField;