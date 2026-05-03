export type ActivityCategory =
  | 'wake'
  | 'sleep'
  | 'exercise'
  | 'study'
  | 'meal'
  | 'rest'
  | 'free';

export type MealKind = 'breakfast' | 'lunch' | 'dinner';

export interface ActivityRecord {
  id: string;
  date: string;
  category: ActivityCategory;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSettings {
  id: 'default';
  wakeTime: string;
  sleepTime: string;
  weeklyExerciseMinutes: number;
  weeklyStudyMinutes: number;
  dailyMealCount: number;
  minimumSleepMinutes: number;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  type: 'daily' | 'weekly';
  date: string;
  good?: string;
  regret?: string;
  tomorrow?: string;
  weeklyReview?: string;
  nextWeek?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
}

export interface RoutineTemplate {
  id: string;
  name: string;
  items: RoutineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSettings {
  id: 'default';
  notion: {
    token: string;
    databaseId: string;
    lastSyncedAt?: string;
    status: 'idle' | 'connected' | 'error';
  };
  naver: {
    connected: boolean;
    lastSyncedAt?: string;
    syncCategories: ActivityCategory[];
  };
  updatedAt: string;
}

export interface LifeBackup {
  exportedAt: string;
  records: ActivityRecord[];
  goals: GoalSettings;
  reflections: Reflection[];
  templates: RoutineTemplate[];
  integrations: IntegrationSettings;
}

export interface ScoreBreakdown {
  sleepRegularity: number;
  studyGoal: number;
  exerciseGoal: number;
  meals: number;
  reflection: number;
  consistency: number;
  total: number;
}
