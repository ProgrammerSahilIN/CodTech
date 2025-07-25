import { useState, useEffect } from 'react';
import { ProductivityData } from '../types';

export const useStorage = () => {
  const [data, setData] = useState<ProductivityData>({
    tasks: [],
    timeEntries: [],
    goals: { daily: 8, weekly: 40 },
    settings: { 
      theme: 'light', 
      pomodoroTime: 25, 
      shortBreak: 5, 
      longBreak: 15,
      notifications: {
        breaks: true,
        goals: true
      }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from Chrome storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['productivity_data'], (result) => {
        if (result.productivity_data) {
          // Ensure notifications object exists for backward compatibility
          const loadedData = {
            ...result.productivity_data,
            settings: {
              ...result.productivity_data.settings,
              notifications: result.productivity_data.settings.notifications || {
                breaks: true,
                goals: true
              }
            }
          };
          setData(loadedData);
        }
        setLoading(false);
      });
    } else {
      // Fallback to localStorage for development
      const stored = localStorage.getItem('productivity_data');
      if (stored) {
        const loadedData = JSON.parse(stored);
        // Ensure notifications object exists for backward compatibility
        setData({
          ...loadedData,
          settings: {
            ...loadedData.settings,
            notifications: loadedData.settings.notifications || {
              breaks: true,
              goals: true
            }
          }
        });
      }
      setLoading(false);
    }
  }, []);

  const saveData = (newData: ProductivityData) => {
    setData(newData);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ productivity_data: newData });
    } else {
      localStorage.setItem('productivity_data', JSON.stringify(newData));
    }
  };

  return { data, saveData, loading };
};