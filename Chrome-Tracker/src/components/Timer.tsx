import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';

interface TimerProps {
  onTimeUpdate: (minutes: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ onTimeUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeSession, setActiveSession] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const newSeconds = prev + 1;
          if (newSeconds % 60 === 0) {
            onTimeUpdate(Math.floor(newSeconds / 60));
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    setActiveSession(activeSession || 'Focus Session');
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setSeconds(0);
    setActiveSession('');
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl md:rounded-2xl border border-purple-200 dark:border-purple-800 shadow-lg">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-200">Time Tracker</h3>
        </div>
        {isRunning && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm text-green-600 dark:text-green-400 font-medium">Recording</span>
          </div>
        )}
      </div>

      <div className="text-center mb-6 md:mb-8">
        <div className="text-4xl md:text-6xl font-mono font-bold text-gray-800 dark:text-gray-200 mb-2 md:mb-4">
          {formatTime(seconds)}
        </div>
        {activeSession && (
          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-1 inline-block">
            {activeSession}
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-3 md:space-x-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium">Start</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Pause className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium">Pause</span>
          </button>
        )}
        
        <button
          onClick={handleStop}
          className="flex items-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={seconds === 0}
        >
          <Square className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-medium">Stop</span>
        </button>
      </div>
    </div>
  );
};