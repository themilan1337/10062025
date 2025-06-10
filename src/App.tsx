import { useState } from 'react';
import { useRealtimePlayers } from './hooks/useRealtimePlayers';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import GameField from './components/GameField';
import LoginForm from './components/LoginForm';
import PlayerList from './components/PlayerList';

function App() {
  const [hasJoined, setHasJoined] = useState(false);
  const { players, playerId, playerName } = useRealtimePlayers();
  const currentPlayer = playerId ? players[playerId] : null;

  // Set up player movement
  usePlayerMovement(playerId, currentPlayer);

  const handleNameSubmit = (name: string) => {
    useRealtimePlayers(name);
    setHasJoined(true);
  };

  if (!hasJoined) {
    return <LoginForm onNameSubmit={handleNameSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-indigo-400 mb-2">2D Arena</h1>
          <p className="text-gray-400">
            Welcome, <span className="text-indigo-400 font-semibold">{playerName}</span>! Use WASD keys to move.
          </p>
        </header>

        <div className="flex gap-4">
          <GameField players={players} currentPlayerId={playerId} />
          <PlayerList players={players} currentPlayerId={playerId} />
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Use WASD or Arrow keys to move your square</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
