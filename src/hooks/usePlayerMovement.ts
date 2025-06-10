import { useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Player } from '../services/supabase';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 4; // Visual size, actual movement is 1px

export const usePlayerMovement = (playerId: string | null, initialX: number, initialY: number) => {
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (!playerId) return;

      let { x, y } = (await supabase.from('players').select('x, y').eq('id', playerId).single()).data || { x: initialX, y: initialY };

      switch (event.key.toLowerCase()) {
        case 'w':
          y = Math.max(0, y - 1);
          break;
        case 's':
          y = Math.min(GAME_HEIGHT - PLAYER_SIZE, y + 1);
          break;
        case 'a':
          x = Math.max(0, x - 1);
          break;
        case 'd':
          x = Math.min(GAME_WIDTH - PLAYER_SIZE, x + 1);
          break;
        default:
          return;
      }

      await supabase.from('players').update({ x, y }).eq('id', playerId);
    },
    [playerId, initialX, initialY]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};