import React from 'react';
import useRealtimePlayers from '../hooks/useRealtimePlayers';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import GameField from './GameField';
import PlayerList from './PlayerList';

interface GameSessionProps {
  initialPlayerName: string;
}

const GameSession: React.FC<GameSessionProps> = ({ initialPlayerName }) => {
  const { players, playerId, playerName } = useRealtimePlayers(initialPlayerName);
  const currentPlayer = playerId ? players[playerId] : null;

  // Set up player movement
  usePlayerMovement(playerId, currentPlayer);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">2D Arena</h1>
          <p className="text-gray-400">
            Welcome, <span className="text-indigo-400 font-semibold">{playerName}</span>! Use WASD keys to move.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4">
          <GameField players={players} currentPlayerId={playerId} />
          <PlayerList players={players} currentPlayerId={playerId} />
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Use WASD or Arrow keys to move your square</p>
        </footer>
      </div>
    </div>
  );
};

export default GameSession;