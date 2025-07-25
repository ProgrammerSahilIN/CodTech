import React, { useState } from 'react';
import { Header } from './components/Header';
import { Timer } from './components/Timer';
import { TaskManager } from './components/TaskManager';
import { StatsOverview } from './components/StatsOverview';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Settings } from './components/Settings';
import { useStorage } from './hooks/useStorage';
import { Task, TimeEntry } from './types';

function App() {
  const { data, saveData, loading } = useStorage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timer' | 'tasks' | 'pomodoro'>('dashboard');
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme on component mount
  React.useEffect(() => {
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data.settings.theme]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  const handleThemeToggle = () => {
    const newTheme = data.settings.theme === 'light' ? 'dark' : 'light';
    const newData = {
      ...data,
      settings: {
        ...data.settings,
        theme: newTheme
      }
    };
    saveData(newData);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSettingsUpdate = (newSettings: typeof data.settings) => {
    saveData({
      ...data,
      settings: newSettings
    });
  };

  const handleGoalsUpdate = (newGoals: typeof data.goals) => {
    saveData({
      ...data,
      goals: newGoals
    });
  };

  const handleTasksUpdate = (tasks: Task[]) => {
    saveData({ ...data, tasks });
  };

  const handleTimeUpdate = (minutes: number) => {
    const entry: TimeEntry = {
      id: Date.now().toString(),
      title: 'Focus Session',
      startTime: new Date(),
      duration: minutes,
      category: 'work'
    };
    
    saveData({
      ...data,
      timeEntries: [...data.timeEntries, entry]
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'timer', label: 'Timer', icon: '⏱️' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'pomodoro', label: 'Pomodoro', icon: '🍅' }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <Header
            theme={data.settings.theme}
            onThemeToggle={handleThemeToggle}
            onSettingsClick={() => setShowSettings(true)}
          />
          
          {/* Desktop Navigation */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-102'
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'dashboard' && 'Track your productivity and view your progress'}
                {activeTab === 'timer' && 'Focus on your work with time tracking'}
                {activeTab === 'tasks' && 'Manage your tasks and stay organized'}
                {activeTab === 'pomodoro' && 'Use the Pomodoro technique for better focus'}
              </p>
            </div>

            <div className="space-y-8">
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <StatsOverview
                    tasks={data.tasks}
                    timeEntries={data.timeEntries}
                    goals={data.goals}
                  />
                  <div className="space-y-6">
                    <Timer onTimeUpdate={handleTimeUpdate} />
                    <TaskManager
                      tasks={data.tasks.slice(0, 3)}
                      onTasksUpdate={handleTasksUpdate}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'timer' && (
                <div className="max-w-2xl mx-auto">
                  <Timer onTimeUpdate={handleTimeUpdate} />
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="max-w-3xl mx-auto">
                  <TaskManager
                    tasks={data.tasks}
                    onTasksUpdate={handleTasksUpdate}
                  />
                </div>
              )}

              {activeTab === 'pomodoro' && (
                <div className="max-w-2xl mx-auto">
                  <PomodoroTimer
                    workTime={data.settings.pomodoroTime}
                    shortBreak={data.settings.shortBreak}
                    longBreak={data.settings.longBreak}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Extension Layout */}
      <div className="md:hidden w-full max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen flex flex-col">
        <Header
          theme={data.settings.theme}
          onThemeToggle={handleThemeToggle}
          onSettingsClick={() => setShowSettings(true)}
        />

        {/* Mobile Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-2 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Mobile Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'dashboard' && (
            <StatsOverview
              tasks={data.tasks}
              timeEntries={data.timeEntries}
              goals={data.goals}
            />
          )}

          {activeTab === 'timer' && (
            <Timer onTimeUpdate={handleTimeUpdate} />
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={data.tasks}
              onTasksUpdate={handleTasksUpdate}
            />
          )}

          {activeTab === 'pomodoro' && (
            <PomodoroTimer
              workTime={data.settings.pomodoroTime}
              shortBreak={data.settings.shortBreak}
              longBreak={data.settings.longBreak}
            />
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={data.settings}
        goals={data.goals}
        onSettingsUpdate={handleSettingsUpdate}
        onGoalsUpdate={handleGoalsUpdate}
      />
    </div>
  );
}

export default App;