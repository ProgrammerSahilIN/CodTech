import React from 'react';
import { Settings, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onThemeToggle, onSettingsClick }) => {
  return (
    <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          ProductivityPro
        </h1>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Track • Focus • Achieve</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onThemeToggle}
          className="p-2 md:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 md:p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};