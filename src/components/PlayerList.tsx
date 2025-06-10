import React from 'react';
import type { Player } from '../hooks/useRealtimePlayers';

interface PlayerListProps {
  players: Record<string, Player>;
  currentPlayerId: string | null;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = Object.values(players).sort((a, b) => a.name.localeCompare(b.name));

  if (sortedPlayers.length === 0) {
    return (
      <div className="w-64 bg-gray-800 p-4 rounded-lg shadow-xl ml-4">
        <h2 className="text-xl font-semibold mb-3 text-indigo-400">Active Players</h2>
        <p className="text-gray-400">No players currently in the game.</p>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-800 p-4 rounded-lg shadow-xl ml-4 flex-shrink-0" style={{maxHeight: '600px', overflowY: 'auto'}}>
      <h2 className="text-xl font-semibold mb-3 text-indigo-400">Active Players ({sortedPlayers.length})</h2>
      <ul className="space-y-2">
        {sortedPlayers.map((player) => (
          <li
            key={player.id}
            className={`flex items-center p-2 rounded-md ${player.id === currentPlayerId ? 'bg-indigo-700' : 'bg-gray-700'}`}
          >
            <div
              className="w-4 h-4 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: player.color }}
            />
            <span className={`truncate ${player.id === currentPlayerId ? 'font-bold text-white' : 'text-gray-300'}`}>
              {player.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;