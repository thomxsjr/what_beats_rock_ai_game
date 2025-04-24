import React, { useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';
import Header from './components/Header';
import { GameProvider } from './context/GameContext';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for user preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <GameProvider>
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="flex-1 container mx-auto p-4 md:p-6 max-w-4xl">
          <GameScreen isDarkMode={isDarkMode} />
        </main>
      </GameProvider>
    </div>
  );
}

export default App;