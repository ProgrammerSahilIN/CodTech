import React, { useState } from 'react';
import { X, Sun, Moon, Clock, Target, Bell, Palette, Save } from 'lucide-react';
import { Settings as SettingsType } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  goals: { daily: number; weekly: number };
  onSettingsUpdate: (settings: SettingsType) => void;
  onGoalsUpdate: (goals: { daily: number; weekly: number }) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  onClose,
  settings,
  goals,
  onSettingsUpdate,
  onGoalsUpdate
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [localGoals, setLocalGoals] = useState(goals);

  if (!isOpen) return null;

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    onGoalsUpdate(localGoals);
    onClose();
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    const newSettings = { ...localSettings, theme };
    setLocalSettings(newSettings);
    
    // Apply theme immediately for preview
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Appearance</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  localSettings.theme === 'light'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Sun className="w-8 h-8 text-yellow-500" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">Light Mode</span>
                  <div className="w-full h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg"></div>
                </div>
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  localSettings.theme === 'dark'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Moon className="w-8 h-8 text-blue-400" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</span>
                  <div className="w-full h-8 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg"></div>
                </div>
              </button>
            </div>
          </div>

          {/* Pomodoro Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Pomodoro Timer</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Work Time (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.pomodoroTime}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    pomodoroTime: parseInt(e.target.value) || 25
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreak}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    shortBreak: parseInt(e.target.value) || 5
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.longBreak}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    longBreak: parseInt(e.target.value) || 15
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Goals Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Productivity Goals</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  value={localGoals.daily}
                  onChange={(e) => setLocalGoals({
                    ...localGoals,
                    daily: parseFloat(e.target.value) || 8
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weekly Goal (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  step="0.5"
                  value={localGoals.weekly}
                  onChange={(e) => setLocalGoals({
                    ...localGoals,
                    weekly: parseFloat(e.target.value) || 40
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Break Reminders</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when it's time for a break</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications?.breaks ?? true}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      breaks: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Daily Goal Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when you reach your daily goal</p>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.notifications?.goals ?? true}
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      goals: e.target.checked
                    }
                  })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};