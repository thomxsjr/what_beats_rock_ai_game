import React from 'react';
import { useGame, Guess } from '../context/GameContext';
import { History } from 'lucide-react';

interface GuessHistoryProps {
  isDarkMode: boolean;
}

const GuessHistory: React.FC<GuessHistoryProps> = ({ isDarkMode }) => {
  const { guesses } = useGame();
  
  // Show only last 5 guesses
  const recentGuesses = [...guesses].reverse().slice(0, 5);

  if (recentGuesses.length === 0) {
    return (
      <div className={`text-center p-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <p className="text-sm">Your guess history will appear here</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-3">
        <History className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
        <h2 className="text-xl font-semibold ml-2">Recent Guesses</h2>
      </div>
      <div className={`rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentGuesses.map((guess, index) => (
            <li 
              key={index} 
              className={`p-4 flex justify-between items-center transition-all duration-300 ${
                index === 0 ? 'bg-green-100 dark:bg-green-900/30' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-lg font-medium">{guess.word}</span>
                <span className="mx-2 text-gray-500">beats</span>
                <span className="text-lg">{guess.beats}</span>
              </div>
              <div className={`text-sm px-3 py-1 rounded-full ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                {guess.globalCount} {guess.globalCount === 1 ? 'time' : 'times'}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GuessHistory;