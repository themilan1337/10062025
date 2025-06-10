import { useEffect, useCallback } from 'react';
import { updatePlayerPosition } from '../services/supabase';
import type { Player } from '../services/supabase';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 1; // Logical size, visual size is 4x4

export const usePlayerMovement = (player: Player | null, setPlayer: React.Dispatch<React.SetStateAction<Player | null>>) => {
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (!player) return;

      let { x, y } = player;
      const moveAmount = 1;

      switch (event.key.toLowerCase()) {
        case 'w':
          y = Math.max(0, y - moveAmount);
          break;
        case 'a':
          x = Math.max(0, x - moveAmount);
          break;
        case 's':
          y = Math.min(GAME_HEIGHT - PLAYER_SIZE, y + moveAmount);
          break;
        case 'd':
          x = Math.min(GAME_WIDTH - PLAYER_SIZE, x + moveAmount);
          break;
        default:
          return;
      }

      if (x !== player.x || y !== player.y) {
        try {
          await updatePlayerPosition(player.id, x, y);
          // Optimistically update local state for smoother perceived movement
          setPlayer(prev => (prev ? { ...prev, x, y } : null));
        } catch (error) {
          console.error('Error updating player position:', error);
          // Optionally revert optimistic update here if needed
        }
      }
    },
    [player, setPlayer]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};