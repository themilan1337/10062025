import { useState, useEffect } from 'react';
import { database } from '../services/firebase';
import type { Player } from '../services/firebase';
import { ref, onValue, off, remove, onDisconnect } from 'firebase/database';

export const useRealtimePlayers = (currentPlayerId: string | null) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const playersRef = ref(database, 'players');

  useEffect(() => {
    const listener = onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playerList = Object.values(data) as Player[];
        setPlayers(playerList);
      } else {
        setPlayers([]);
      }
    });

    // Firebase listener cleanup
    return () => {
      off(playersRef, 'value', listener);
    };
  }, []);

  // Handle player exit using onDisconnect
  useEffect(() => {
    if (currentPlayerId) {
      const playerRef = ref(database, `players/${currentPlayerId}`);
      const onDisconnectRef = onDisconnect(playerRef);
      onDisconnectRef.remove()
        .then(() => console.log(`onDisconnect rule set for player ${currentPlayerId}`))
        .catch((error) => console.error('Error setting onDisconnect rule:', error));

      // Keep alive / update presence (optional, can be more complex)
      // For simplicity, we're just ensuring removal on disconnect.
      // A more robust presence system might involve updating a 'lastSeen' timestamp.

      // Fallback for tab close / component unmount if onDisconnect doesn't fire immediately
      // or if you want to be more explicit.
      const handleBeforeUnload = () => {
        // Firebase onDisconnect should handle this, but as a fallback:
        remove(playerRef).catch(err => console.error('Error in beforeunload cleanup delete:', err));
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Explicitly remove player if component unmounts and onDisconnect hasn't fired
        // This is a bit aggressive and might conflict with onDisconnect if not careful.
        // Consider if onDisconnect is sufficient for your needs.
        // For this example, we'll rely primarily on onDisconnect and beforeunload.
        // remove(playerRef).catch(err => console.error('Error in unmount cleanup delete:', err));

        // Cancel the onDisconnect operation if the component unmounts cleanly
        // and the user isn't actually disconnecting (e.g., navigating away in SPA)
        // This prevents removal if the user is just navigating within the app.
        // However, for a simple game where unmount means 'left the game', removal is desired.
        onDisconnectRef.cancel().catch(err => console.error('Error cancelling onDisconnect:', err));
      };
    }
  }, [currentPlayerId]);

  return players;
};