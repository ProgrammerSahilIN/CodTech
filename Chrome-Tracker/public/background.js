// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default data
  chrome.storage.local.get(['productivity_data'], (result) => {
    if (!result.productivity_data) {
      chrome.storage.local.set({
        productivity_data: {
          tasks: [],
          timeEntries: [],
          goals: {
            daily: 8,
            weekly: 40
          },
          settings: {
            theme: 'light',
            pomodoroTime: 25,
            shortBreak: 5,
            longBreak: 15
          }
        }
      });
    }
  });
});

// Handle timer notifications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startTimer') {
    // Timer logic would go here
  } else if (request.action === 'stopTimer') {
    // Stop timer logic
  }
});