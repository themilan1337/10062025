import { useEffect } from 'react';
import { database, ref, update } from '../services/firebase';
import type { Player } from './useRealtimePlayers'; // Assuming Player interface is exported

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 1; // Logical size, visual size will be handled by rendering
const MOVE_STEP = 5; // Pixels to move per key press

export const usePlayerMovement = (playerId: string | null, currentPlayer: Player | null) => {
  useEffect(() => {
    if (!playerId || !currentPlayer) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!currentPlayer) return;

      let newX = currentPlayer.x;
      let newY = currentPlayer.y;

      switch (event.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          newY -= MOVE_STEP;
          break;
        case 's':
        case 'arrowdown':
          newY += MOVE_STEP;
          break;
        case 'a':
        case 'arrowleft':
          newX -= MOVE_STEP;
          break;
        case 'd':
        case 'arrowright':
          newX += MOVE_STEP;
          break;
        default:
          return; // Ignore other keys
      }

      // Boundary checks
      newX = Math.max(0, Math.min(GAME_WIDTH - PLAYER_SIZE, newX));
      newY = Math.max(0, Math.min(GAME_HEIGHT - PLAYER_SIZE, newY));

      // Update Firebase if position changed
      if (newX !== currentPlayer.x || newY !== currentPlayer.y) {
        const playerRef = ref(database, `players/${playerId}`);
        update(playerRef, { x: newX, y: newY })
          .catch(err => console.error('Error updating player position:', err));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [playerId, currentPlayer]); // Rerun if playerId or currentPlayer object changes
};