import React, { useState } from 'react';

interface PlayerNameFormProps {
  onSubmitName: (name: string) => void;
}

const PlayerNameForm: React.FC<PlayerNameFormProps> = ({ onSubmitName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmitName(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg shadow-xl text-white w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Enter Your Nickname</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="E.g., PlayerOne"
          className="w-full p-3 mb-6 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
          maxLength={20} // Optional: limit nickname length
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-150 ease-in-out disabled:opacity-50"
          disabled={!name.trim()}
        >
          Join Game
        </button>
      </form>
    </div>
  );
};

export default PlayerNameForm;