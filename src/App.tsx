import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GameField from './components/GameField';
import PlayerNameForm from './components/PlayerNameForm';
import PlayerList from './components/PlayerList';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { useRealtimePlayers } from './hooks/useRealtimePlayers';
import { database } from './services/firebase'; // Assuming auth might be needed later
import type { Player } from './services/firebase';
import { ref, set, onDisconnect } from 'firebase/database';
import './App.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [showNameForm, setShowNameForm] = useState(true);

  const allPlayers = useRealtimePlayers(currentPlayer?.id || null);
  usePlayerMovement(currentPlayer, setCurrentPlayer);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleNameSubmit = useCallback(async (name: string) => {
    setShowNameForm(false);

    const newPlayerId = uuidv4();
    const newPlayer: Player = {
      id: newPlayerId,
      x: Math.floor(GAME_WIDTH / 2 / 4) * 4, // Center and align to visual grid
      y: Math.floor(GAME_HEIGHT / 2 / 4) * 4,
      color: getRandomColor(),
      name: name,
    };

    try {
      const playerRef = ref(database, 'players/' + newPlayer.id);
      await set(playerRef, newPlayer);
      setCurrentPlayer(newPlayer);
      console.log('Player joined:', newPlayer);

      // Setup onDisconnect here as well, or ensure useRealtimePlayers covers it robustly
      // Duplicating onDisconnect setup can be tricky; prefer centralizing it in the hook.
      // However, if App.tsx is the source of truth for currentPlayer creation,
      // it might make sense to initiate onDisconnect here.
      const disconnectRef = onDisconnect(playerRef);
      disconnectRef.remove().catch(err => console.error('Error setting onDisconnect in App.tsx:', err));
    } catch (error) {
      console.error('Error inserting player:', error);
      // Handle error, e.g., show a message to the user
      setShowNameForm(true); // Re-show form on error
    }
  }, []);
  
  // Graceful disconnect
 useEffect(() => {
    // Firebase presence and disconnect logic is now primarily in useRealtimePlayers
    // However, we might still want to handle specific App-level cleanup or initial setup here.
    // For now, much of the direct Supabase channel logic is removed or handled by the hook.

    const handleBeforeUnload = async () => {
      if (currentPlayer) {
        // Standard way to ask for confirmation before leaving
        // event.preventDefault();
        // event.returnValue = ''; // Required for Chrome
        try {
          // The deletePlayer call is now primarily handled by useRealtimePlayers hook
          // but we can keep a failsafe or specific logic here if needed.
          // For Supabase Realtime, often the server handles disconnects based on presence.
          // If using explicit delete on client side, ensure it's robust.
          console.log('Attempting to clean up player on unload:', currentPlayer.id);
          // Firebase's onDisconnect in useRealtimePlayers should handle this.
        } catch (error) {
          console.error('Error during beforeunload cleanup:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (currentPlayer) {
        // Ensure player is deleted if App unmounts (e.g. SPA navigation)
        // This is a more reliable place than just beforeunload for some scenarios
        // Firebase's onDisconnect in useRealtimePlayers should handle this.
        // If specific app-level cleanup for Firebase is needed, add it here.
        // For example, if there were direct Firebase listeners in App.tsx (not recommended, keep in hooks)
      }
    };
  }, [currentPlayer]);

  if (showNameForm) {
    return <PlayerNameForm onSubmitName={handleNameSubmit} />;
  }

  if (!currentPlayer) {
    // This state could occur if name is submitted but player creation fails
    // or if waiting for player data after re-joining.
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <p>Loading player data or connection error...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
      <h1 className="text-4xl font-bold mb-6">React Realtime Pixel Game</h1>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <GameField players={allPlayers} currentPlayerId={currentPlayer.id} />
        <div className="w-full md:w-64">
            <PlayerList players={allPlayers} currentPlayerId={currentPlayer.id} />
        </div>
      </div>
      <div className="mt-6 p-4 bg-gray-800 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">Controls:</h2>
        <p className="text-gray-300">Use <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">W</kbd> <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">A</kbd> <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">S</kbd> <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">D</kbd> keys to move your square.</p>
        <p className="text-gray-400 text-sm mt-2">Your color: <span style={{display: 'inline-block', width: '12px', height: '12px', backgroundColor: currentPlayer.color, border: '1px solid white'}}></span></p>
      </div>
    </div>
  );
}

export default App;
