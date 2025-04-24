import React from 'react';
import { Zap, Moon, Sun, RefreshCw } from 'lucide-react';
import { useGame } from '../context/GameContext';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { resetGame, togglePersona, persona } = useGame();

  return (
    <header className={`py-4 px-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto max-w-4xl flex justify-between items-center">
        <div className="flex items-center">
          <Zap className={`mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-blue-600'}`} size={24} />
          <h1 className="text-xl font-bold">What Beats Rock?</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePersona}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {persona === 'serious' ? 'Serious Mode' : 'Cheery Mode'}
          </button>
          
          <button
            onClick={resetGame}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label="Reset Game"
          >
            <RefreshCw size={18} />
          </button>
          
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;