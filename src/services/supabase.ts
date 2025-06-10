import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

export const insertPlayer = async (player: Player) => {
  const { error } = await supabase.from('players').insert(player);
  if (error) throw error;
};

export const updatePlayerPosition = async (id: string, x: number, y: number) => {
  const { error } = await supabase
    .from('players')
    .update({ x, y })
    .eq('id', id);
  if (error) throw error;
};

export const deletePlayer = async (id: string) => {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
};