import { useState, useEffect, useRef } from 'react';
import { database, playersRef, onValue, set, onDisconnect, remove, ref } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const useRealtimePlayers = (initialName?: string) => {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>('');

  const playerRef = useRef<any>(null); // Firebase Ref

  useEffect(() => {
    const id = uuidv4();
    setPlayerId(id);
    const name = initialName || `Player_${id.substring(0, 4)}`;
    setPlayerName(name);

    const color = getRandomColor();
    const initialX = 400; // Center of 800x600 field
    const initialY = 300;

    if (id) {
      playerRef.current = ref(database, `players/${id}`);
      const newPlayer: Player = {
        id,
        x: initialX,
        y: initialY,
        color,
        name,
      };

      set(playerRef.current, newPlayer)
        .then(() => {
          console.log('Player added to Firebase');
          onDisconnect(playerRef.current).remove()
            .then(() => console.log('onDisconnect setup for player', id))
            .catch(err => console.error('Error setting up onDisconnect:', err));
        })
        .catch(err => console.error('Error adding player to Firebase:', err));
    }

    // Listen for changes to all players
    const unsubscribe = onValue(playersRef, (snapshot) => {
      const playersData = snapshot.val();
      if (playersData) {
        setPlayers(playersData);
      } else {
        setPlayers({}); // No players or node deleted
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      if (playerRef.current) {
        remove(playerRef.current).catch(err => console.error('Error removing player on unmount:', err));
      }
    };
  }, [initialName]); // Re-run if initialName changes, though typically it won't after first load

  return { players, playerId, playerName };
};

export default useRealtimePlayers;