import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import GuessHistory from './GuessHistory';
import confetti from 'canvas-confetti';
import { Lightbulb, Send } from 'lucide-react';

interface GameScreenProps {
  isDarkMode: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ isDarkMode }) => {
  const {
    currentWord,
    score,
    isLoading,
    gameOver,
    errorMessage,
    submitGuess,
    resetGame,
    persona
  } = useGame();

  const [guess, setGuess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input when game starts or resets
    if (!gameOver && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameOver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitGuess(guess);
    setGuess('');
  };

  // Trigger confetti on score increase
  useEffect(() => {
    if (score > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [score]);

  return (
    <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-all duration-300`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">What Beats {currentWord}?</h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {persona === 'serious' ? 'Think strategically. What would overcome this?' : 'Get creative! What would win against this?'}
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold">Score: {score}</div>
          <div className={`px-4 py-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} flex items-center`}>
            <Lightbulb className={`mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-blue-500'}`} size={18} />
            <span className="text-sm">Type what beats "{currentWord}"</span>
          </div>
        </div>

        {gameOver ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Game Over!</h2>
            <p className="mb-6">{errorMessage}</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={isLoading || gameOver}
              placeholder={`What beats ${currentWord}?`}
              className={`w-full p-4 rounded-lg pr-12 ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all`}
            />
            <button
              type="submit"
              disabled={isLoading || !guess.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                isLoading || !guess.trim()
                  ? `${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} cursor-not-allowed`
                  : `${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} hover:bg-blue-700`
              } transition-colors`}
            >
              <Send className="text-white" size={20} />
            </button>
          </form>
        )}

        {errorMessage && !gameOver && (
          <div className="mt-2 text-red-500 text-sm">{errorMessage}</div>
        )}
      </div>

      <GuessHistory isDarkMode={isDarkMode} />
    </div>
  );
};

export default GameScreen;