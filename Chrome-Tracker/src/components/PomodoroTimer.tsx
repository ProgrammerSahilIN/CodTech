import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';

interface PomodoroTimerProps {
  workTime: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ 
  workTime = 25, 
  shortBreak = 5, 
  longBreak = 15 
}) => {
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [cycle, setCycle] = useState(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsRunning(false);
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (mode === 'work') {
      if (cycle % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreak * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(workTime * 60);
      setCycle(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode('work');
    setTimeLeft(workTime * 60);
    setCycle(1);
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'work':
        return {
          title: 'Focus Time',
          color: 'from-red-500 to-pink-500',
          bgColor: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          icon: Play
        };
      case 'shortBreak':
        return {
          title: 'Short Break',
          color: 'from-green-500 to-emerald-500',
          bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          icon: Coffee
        };
      case 'longBreak':
        return {
          title: 'Long Break',
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          icon: Coffee
        };
    }
  };

  const config = getModeConfig();
  const progress = mode === 'work' 
    ? (1 - timeLeft / (workTime * 60)) * 100
    : mode === 'shortBreak'
    ? (1 - timeLeft / (shortBreak * 60)) * 100
    : (1 - timeLeft / (longBreak * 60)) * 100;

  return (
    <div className={`p-4 md:p-6 bg-gradient-to-br ${config.bgColor} rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg`}>
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
          <config.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-200">{config.title}</h3>
        </div>
        
        <div className="text-4xl md:text-6xl font-mono font-bold text-gray-800 dark:text-gray-200 mb-2 md:mb-4">
          {formatTime(timeLeft)}
        </div>
        
        <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-1 inline-block">
          Cycle {cycle} • {mode === 'work' ? 'Work' : 'Break'} Session
        </div>

        {/* Progress ring */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 md:mb-6">
          <svg className="transform -rotate-90 w-32 h-32 md:w-40 md:h-40">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className={`transition-all duration-1000 ${
                mode === 'work' ? 'text-red-500' : mode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'
              }`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r ${config.color} hover:opacity-90 text-white rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
          >
            {isRunning ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="font-medium">{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};