import type { Player } from '../services/supabase';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export const PlayerList = ({ players, currentPlayerId }: PlayerListProps) => {
  return (
    <div className="fixed top-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs w-full">
      <h3 className="text-white font-semibold mb-3 text-lg">Active Players</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.id}
            className={`flex items-center space-x-3 p-2 rounded ${player.id === currentPlayerId ? 'bg-gray-700' : 'bg-gray-900'}`}
          >
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: player.color }}
            />
            <span className="text-white">
              {player.name || 'Anonymous'}
              {player.id === currentPlayerId && ' (You)'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-gray-400 text-sm">
        {players.length} player{players.length !== 1 ? 's' : ''} online
      </div>
    </div>
  );
};