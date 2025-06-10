import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../services/supabase';

interface LoginFormProps {
  playerId: string;
  onNameSet: () => void;
}

export const LoginForm = ({ playerId, onNameSet }: LoginFormProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('players')
      .update({ name })
      .eq('id', playerId);

    setLoading(false);
    if (updateError) {
      console.error('Error updating player name:', updateError);
      setError('Failed to set name. Please try again.');
    } else {
      onNameSet();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Enter Your Nickname</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Nickname"
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={20}
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Set Nickname & Play'}
        </button>
      </form>
    </div>
  );
};