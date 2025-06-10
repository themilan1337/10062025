import React from 'react';
import type { Player } from '../hooks/useRealtimePlayers';

interface GameFieldProps {
  players: Record<string, Player>;
  currentPlayerId: string | null;
}

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const VISUAL_PLAYER_SIZE = 4; // Visual size of the player square

const GameField: React.FC<GameFieldProps> = ({ players, currentPlayerId }) => {
  return (
    <div
      className="relative bg-gray-800 border-2 border-gray-500"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
    >
      {Object.values(players).map((player) => (
        <div key={player.id}>
          <div
            className={`absolute`}
            style={{
              left: `${player.x - VISUAL_PLAYER_SIZE / 2}px`,
              top: `${player.y - VISUAL_PLAYER_SIZE / 2}px`,
              width: `${VISUAL_PLAYER_SIZE}px`,
              height: `${VISUAL_PLAYER_SIZE}px`,
              backgroundColor: player.color,
              border: player.id === currentPlayerId ? '1px solid white' : 'none',
              boxSizing: 'border-box',
            }}
          />
          <div
            className="absolute text-xs text-white select-none"
            style={{
              left: `${player.x + VISUAL_PLAYER_SIZE}px`,
              top: `${player.y - VISUAL_PLAYER_SIZE / 2 - 6}px`, // Adjust for label positioning
              transform: 'translateY(-50%)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none', // So labels don't interfere with potential interactions
            }}
          >
            {player.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameField;