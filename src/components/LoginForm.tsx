import React, { useState } from 'react';

interface LoginFormProps {
  onNameSubmit: (name: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onNameSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">Enter the Arena!</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-300 mb-1">
              Choose Your Nickname:
            </label>
            <input
              type="text"
              id="nickname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., PixelWarrior"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
              maxLength={20}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition duration-150 disabled:opacity-50"
            disabled={!name.trim()}
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;