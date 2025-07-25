import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, onTasksUpdate }) => {
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      priority,
      createdAt: new Date()
    };

    onTasksUpdate([...tasks, task]);
    setNewTask('');
    setPriority('medium');
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    );
    onTasksUpdate(updatedTasks);
  };

  const deleteTask = (id: string) => {
    onTasksUpdate(tasks.filter(task => task.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="font-semibold text-lg md:text-xl text-gray-800 dark:text-gray-200">Tasks</h3>
        <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {completedTasks}/{totalTasks} completed
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 md:h-3 mb-4 md:mb-6">
        <div
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 md:h-3 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%' }}
        ></div>
      </div>

      {/* Add new task */}
      <div className="mb-4 md:mb-6 space-y-3">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all duration-200"
        />
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg md:rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <button
            onClick={addTask}
            className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-sm md:text-base rounded-lg md:rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3 max-h-64 md:max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center space-x-3 p-3 md:p-4 rounded-lg md:rounded-xl border transition-all duration-200 ${
              task.completed
                ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md hover:scale-102'
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 md:w-6 md:h-6 text-gray-400 hover:text-purple-500 transition-colors" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className={`text-sm md:text-base ${task.completed ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {task.title}
              </div>
            </div>

            <div className={`px-2 py-1 rounded-full text-xs flex items-center ${getPriorityColor(task.priority)}`}>
              <AlertCircle className="w-3 h-3" />
            </div>

            <button
              onClick={() => deleteTask(task.id)}
              className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 transition-all duration-200 hover:scale-110"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
            <Circle className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm md:text-base">No tasks yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};