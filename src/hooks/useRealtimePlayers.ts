import { useState, useEffect, useRef } from 'react';
import { supabase, deletePlayer } from '../services/supabase';
import type { Player } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimePlayers = (currentPlayerId: string | null) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const fetchInitialPlayers = async () => {
      const { data, error } = await supabase.from('players').select('*');
      if (error) {
        console.error('Error fetching initial players:', error);
      } else if (data) {
        setPlayers(data as Player[]);
      }
    };

    fetchInitialPlayers();

    const channel = supabase
      .channel('realtime-players')
      .on<
        Player
      >(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
          console.log('Change received!', payload);
          const newPlayer = payload.new as Player;
          const oldPlayer = payload.old as Player;

          setPlayers((prevPlayers) => {
            switch (payload.eventType) {
              case 'INSERT':
                return [...prevPlayers, newPlayer];
              case 'UPDATE':
                return prevPlayers.map((p) =>
                  p.id === newPlayer.id ? newPlayer : p
                );
              case 'DELETE':
                return prevPlayers.filter((p) => p.id !== oldPlayer.id);
              default:
                return prevPlayers;
            }
          });
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Realtime subscription error:', err);
        }
        console.log('Realtime subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log('Unsubscribed from realtime-players');
      }
    };
  }, []);

  // Handle player exit
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentPlayerId) {
        try {
          // Attempt to delete the player before the tab closes
          // This might not always succeed due to browser limitations
          await deletePlayer(currentPlayerId);
          console.log(`Player ${currentPlayerId} marked for deletion.`);
        } catch (error) {
          console.error('Error deleting player on exit:', error);
        }
      }
    };

    if (currentPlayerId) {
        window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      if (currentPlayerId) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Ensure player is deleted if the component unmounts for other reasons
        // (e.g., navigation within a single-page app)
        // However, Supabase Realtime presence can also handle this if configured.
        // For this example, we rely on beforeunload and explicit delete.
        if (channelRef.current?.state === 'joined') { // Check if channel is still active
             deletePlayer(currentPlayerId).catch(err => console.error('Error in unmount cleanup delete:', err));
        }
      }
    };
  }, [currentPlayerId]);

  return players;
};