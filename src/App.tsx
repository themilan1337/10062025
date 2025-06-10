import { useState } from 'react';
import LoginForm from './components/LoginForm';
import GameSession from './components/GameSession';

function App() {
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const handleNameSubmit = (name: string) => {
    setSubmittedName(name);
  };

  if (!submittedName) {
    return <LoginForm onNameSubmit={handleNameSubmit} />;
  }

  return <GameSession initialPlayerName={submittedName} />;
}

export default App;
