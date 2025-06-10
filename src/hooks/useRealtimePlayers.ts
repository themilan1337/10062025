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

const useRealtimePlayers = (initialName: string) => {
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>(initialName);

  const playerRef = useRef<any>(null); // Firebase Ref

  useEffect(() => {
    const id = uuidv4();
    setPlayerId(id);
    // Use the playerName state which is initialized with initialName

    const color = getRandomColor();
    const initialX = 400; // Center of 800x600 field
    const initialY = 300;

    playerRef.current = ref(database, `players/${id}`);
    const newPlayer: Player = {
      id,
      x: initialX,
      y: initialY,
      color,
      name: playerName, // Use the state here
    };

    set(playerRef.current, newPlayer)
      .then(() => {
        console.log('Player added to Firebase:', playerName);
        // Set up listener for player removal on disconnect
        onDisconnect(playerRef.current).remove();
      })
      .catch((error) => {
        console.error('Error adding player to Firebase: ', error);
      });

    // Listen for changes to players
    const unsubscribePlayers = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      setPlayers(data || {});
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribePlayers();
      if (playerRef.current) {
        remove(playerRef.current)
          .then(() => console.log('Player removed on unmount/disconnect:', playerName))
          .catch(err => console.error('Error removing player on unmount:', err));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName]); // Effect depends on playerName, which is stable after initial set.

  return { players, playerId, playerName };
};

export default useRealtimePlayers;