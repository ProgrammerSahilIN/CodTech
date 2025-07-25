import React from 'react';
import { BarChart3, Target, Clock, CheckCircle } from 'lucide-react';
import { Task, TimeEntry, Goals } from '../types';

interface StatsOverviewProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  goals: Goals;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ tasks, timeEntries, goals }) => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

  // Today's stats
  const todayTasks = tasks.filter(task => 
    new Date(task.createdAt) >= startOfDay
  );
  const todayCompletedTasks = todayTasks.filter(task => task.completed);
  
  const todayTimeEntries = timeEntries.filter(entry =>
    new Date(entry.startTime) >= startOfDay
  );
  const todayHours = todayTimeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;

  // Week's stats
  const weekTimeEntries = timeEntries.filter(entry =>
    new Date(entry.startTime) >= startOfWeek
  );
  const weekHours = weekTimeEntries.reduce((sum, entry) => sum + entry.duration, 0) / 60;

  const stats = [
    {
      title: 'Today\'s Focus',
      value: `${todayHours.toFixed(1)}h`,
      target: `${goals.daily}h`,
      progress: (todayHours / goals.daily) * 100,
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Tasks Done',
      value: todayCompletedTasks.length,
      target: todayTasks.length,
      progress: todayTasks.length > 0 ? (todayCompletedTasks.length / todayTasks.length) * 100 : 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Weekly Goal',
      value: `${weekHours.toFixed(1)}h`,
      target: `${goals.weekly}h`,
      progress: (weekHours / goals.weekly) * 100,
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl md:rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-lg">
      <div className="flex items-center space-x-2 mb-4 md:mb-6">
        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-200">Today's Overview</h3>
      </div>

      <div className="space-y-4 md:space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">{stat.title}</p>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    {typeof stat.target === 'string' ? `Goal: ${stat.target}` : `${stat.value}/${stat.target}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {Math.min(100, stat.progress).toFixed(0)}%
                </p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3">
              <div
                className={`h-2 md:h-3 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500 shadow-sm`}
                style={{ width: `${Math.min(100, stat.progress)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};