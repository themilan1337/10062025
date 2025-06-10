import React from 'react';
import type { Player } from '../services/firebase';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId }) => {
  if (!players.length) {
    return (
      <div className="p-4 bg-gray-800 text-gray-400 rounded-lg shadow-md">
        No players currently active.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md text-white max-h-60 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Active Players ({players.length})</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id} className={`flex items-center mb-2 p-2 rounded-md ${player.id === currentPlayerId ? 'bg-blue-600' : 'bg-gray-700'}`}>
            <span
              className="w-4 h-4 rounded-full mr-3 border-2 border-gray-900"
              style={{ backgroundColor: player.color }}
            ></span>
            <span className="font-medium">{player.name || 'Anonymous'}</span>
            {player.id === currentPlayerId && <span className="ml-auto text-xs text-blue-200">(You)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;