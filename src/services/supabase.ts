import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name?: string;
}

// Initialize realtime subscription
export const initializeRealtimePlayers = (onPlayerChange: (players: Player[]) => void) => {
  return supabase
    .channel('players')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players'
      },
      () => {
        // Fetch all players when any change occurs
        supabase
          .from('players')
          .select('*')
          .then(({ data }) => {
            if (data) {
              onPlayerChange(data as Player[]);
            }
          });
      }
    )
    .subscribe();
};