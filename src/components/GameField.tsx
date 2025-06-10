import { useRef, useEffect } from 'react';
import type { Player } from '../services/supabase';

interface GameFieldProps {
  players: Player[];
  currentPlayerId: string | null;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 4;

export const GameField = ({ players, currentPlayerId }: GameFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw players
    players.forEach((player) => {
      ctx.fillStyle = player.color;
      // Draw slightly larger square for current player
      if (player.id === currentPlayerId) {
        ctx.fillRect(
          player.x - 1,
          player.y - 1,
          PLAYER_SIZE + 2,
          PLAYER_SIZE + 2
        );
      } else {
        ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
      }

      // Draw player name if exists
      if (player.name) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, player.x + PLAYER_SIZE / 2, player.y - 5);
      }
    });
  }, [players, currentPlayerId]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="border-2 border-gray-700 rounded-lg shadow-lg"
      />
    </div>
  );
};