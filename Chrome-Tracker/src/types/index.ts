export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  completedAt?: Date;
}

export interface TimeEntry {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  category: string;
}

export interface Goals {
  daily: number; // hours
  weekly: number; // hours
}

export interface Settings {
  theme: 'light' | 'dark';
  pomodoroTime: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  notifications?: {
    breaks: boolean;
    goals: boolean;
  };
}

export interface ProductivityData {
  tasks: Task[];
  timeEntries: TimeEntry[];
  goals: Goals;
  settings: Settings;
}