import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config';

export interface Guess {
  word: string;
  beats: string;
  globalCount: number;
}

interface GameContextType {
  currentWord: string;
  guesses: Guess[];
  score: number;
  isLoading: boolean;
  gameOver: boolean;
  errorMessage: string;
  persona: 'serious' | 'cheery';
  submitGuess: (guess: string) => Promise<void>;
  resetGame: () => void;
  togglePersona: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentWord, setCurrentWord] = useState('Rock');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [persona, setPersona] = useState<'serious' | 'cheery'>('cheery');

  useEffect(() => {
    // Initialize game
    resetGame();
  }, []);

  const resetGame = () => {
    setCurrentWord('Rock');
    setGuesses([]);
    setScore(0);
    setGameOver(false);
    setErrorMessage('');
  };

  const togglePersona = () => {
    setPersona(prev => prev === 'serious' ? 'cheery' : 'serious');
  };

  const submitGuess = async (guess: string) => {
    if (!guess.trim()) {
      setErrorMessage('Please enter a guess');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/api/guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Persona': persona
        },
        body: JSON.stringify({
          guess: guess.trim(),
          current: currentWord
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'duplicate_guess') {
          setGameOver(true);
          setErrorMessage(`Game Over! "${guess}" has already been guessed.`);
        } else {
          setErrorMessage(data.message || 'Something went wrong');
        }
        setIsLoading(false);
        return;
      }

      if (data.success) {
        // Add the new guess to our list
        const newGuess: Guess = {
          word: guess,
          beats: currentWord,
          globalCount: data.globalCount
        };
        
        setGuesses(prev => [...prev, newGuess]);
        setCurrentWord(guess);
        setScore(prev => prev + 1);
      } else {
        setErrorMessage(`Sorry, "${guess}" doesn't beat "${currentWord}".`);
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      console.error('Error submitting guess:', error);
    }

    setIsLoading(false);
  };

  const value = {
    currentWord,
    guesses,
    score,
    isLoading,
    gameOver,
    errorMessage,
    persona,
    submitGuess,
    resetGame,
    togglePersona
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};