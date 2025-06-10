import { useState, useEffect } from 'react';
import { supabase, initializeRealtimePlayers } from '../services/supabase';
import type { Player } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial players
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from('players').select('*');
      if (error) {
        console.error('Error fetching players:', error);
      } else if (data) {
        setPlayers(data as Player[]);
      }
    };

    fetchPlayers();

    // Subscribe to realtime updates
    const channel: RealtimeChannel = initializeRealtimePlayers(setPlayers);

    // Create a new player if one doesn't exist for this session
    const createPlayer = async () => {
      const localPlayerId = localStorage.getItem('playerId');
      if (localPlayerId) {
        const { data } = await supabase.from('players').select('id').eq('id', localPlayerId).single();
        if (data) {
            setCurrentPlayerId(localPlayerId);
            return; // Player already exists
        }
      }

      const newPlayerId = crypto.randomUUID();
      const newPlayer: Player = {
        id: newPlayerId,
        x: Math.floor(Math.random() * (800 - 4)), // GAME_WIDTH - PLAYER_SIZE
        y: Math.floor(Math.random() * (600 - 4)), // GAME_HEIGHT - PLAYER_SIZE
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      };

      const { error } = await supabase.from('players').insert(newPlayer);
      if (error) {
        console.error('Error creating player:', error);
      } else {
        localStorage.setItem('playerId', newPlayerId);
        setCurrentPlayerId(newPlayerId);
        // No need to call setPlayers here as the realtime subscription will pick it up
      }
    };

    createPlayer();

    // Clean up subscription and player on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      const playerIdToRemove = localStorage.getItem('playerId');
      if (playerIdToRemove) {
        supabase.from('players').delete().eq('id', playerIdToRemove).then(({ error }) => {
          if (error) console.error('Error deleting player on exit:', error);
          localStorage.removeItem('playerId');
        });
      }
    };
  }, []);

  return { players, currentPlayerId };
};