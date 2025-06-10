import { useState, useEffect } from 'react';
import { GameField } from './components/GameField';
import { PlayerList } from './components/PlayerList';
import { LoginForm } from './components/LoginForm';
import { useRealtimePlayers } from './hooks/useRealtimePlayers';
import { usePlayerMovement } from './hooks/usePlayerMovement';
import { supabase } from './services/supabase';
import './index.css'; // Ensure Tailwind is imported

function App() {
  const { players, currentPlayerId } = useRealtimePlayers();
  const [showLogin, setShowLogin] = useState(false);
  const [initialPlayerPos, setInitialPlayerPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (currentPlayerId) {
      const checkPlayerName = async () => {
        const { data: player, error } = await supabase
          .from('players')
          .select('name, x, y')
          .eq('id', currentPlayerId)
          .single();

        if (error) {
          console.error('Error fetching player details:', error);
          // Handle error, maybe show login form as a fallback
          setShowLogin(true);
          setInitialPlayerPos({ x: Math.floor(Math.random() * (800 - 4)), y: Math.floor(Math.random() * (600 - 4)) });
          return;
        }

        if (player) {
          setInitialPlayerPos({ x: player.x, y: player.y });
          if (!player.name) {
            setShowLogin(true);
          } else {
            setShowLogin(false);
          }
        }
      };
      checkPlayerName();
    }
  }, [currentPlayerId]);

  // Initialize movement hook only when currentPlayerId and initial positions are available
  usePlayerMovement(currentPlayerId, initialPlayerPos?.x ?? 0, initialPlayerPos?.y ?? 0);

  const handleNameSet = () => {
    setShowLogin(false);
  };

  if (!currentPlayerId || !initialPlayerPos) {
    // Loading state or initial setup phase
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <p className="text-white text-2xl">Loading Game...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {showLogin && currentPlayerId && (
        <LoginForm playerId={currentPlayerId} onNameSet={handleNameSet} />
      )}
      <GameField players={players} currentPlayerId={currentPlayerId} />
      <PlayerList players={players} currentPlayerId={currentPlayerId} />
    </div>
  );
}

export default App;
