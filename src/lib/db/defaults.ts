import type { GoalSettings, IntegrationSettings, RoutineTemplate } from '../../types';

export const defaultGoals: GoalSettings = {
  id: 'default',
  wakeTime: '07:00',
  sleepTime: '23:30',
  weeklyExerciseMinutes: 180,
  weeklyStudyMinutes: 900,
  weeklySelfDevelopmentMinutes: 300,
  dailyMealCount: 3,
  minimumSleepMinutes: 420,
  updatedAt: new Date().toISOString()
};

export const defaultIntegrations: IntegrationSettings = {
  id: 'default',
  notion: {
    token: '',
    databaseId: '',
    status: 'idle'
  },
  naver: {
    connected: false,
    syncCategories: ['study', 'exercise', 'meal', 'sleep']
  },
  updatedAt: new Date().toISOString()
};

export const defaultTemplates: RoutineTemplate[] = [
  {
    id: 'weekday',
    name: '평일 루틴',
    items: [
      { id: 'w1', title: '기상', category: 'wake', startTime: '07:00', endTime: '07:10' },
      { id: 'w2', title: '공부', category: 'study', startTime: '09:00', endTime: '12:00' },
      { id: 'w3', title: '운동', category: 'exercise', startTime: '18:30', endTime: '19:30' },
      { id: 'w4', title: '취침', category: 'sleep', startTime: '23:30', endTime: '07:00' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'weekend',
    name: '주말 루틴',
    items: [
      { id: 's1', title: '늦은 기상', category: 'wake', startTime: '08:30', endTime: '08:40' },
      { id: 's2', title: '휴식', category: 'rest', startTime: '14:00', endTime: '16:00' },
      { id: 's3', title: '가벼운 운동', category: 'exercise', startTime: '17:00', endTime: '17:40' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'exam',
    name: '시험기간 루틴',
    items: [
      { id: 'e1', title: '오전 집중 공부', category: 'study', startTime: '08:30', endTime: '12:30' },
      { id: 'e2', title: '오후 집중 공부', category: 'study', startTime: '14:00', endTime: '18:00' },
      { id: 'e3', title: '짧은 휴식', category: 'rest', startTime: '20:00', endTime: '20:30' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'exercise-focus',
    name: '운동 집중 루틴',
    items: [
      { id: 'f1', title: '근력 운동', category: 'exercise', startTime: '07:30', endTime: '08:30' },
      { id: 'f2', title: '회복 식사', category: 'meal', startTime: '08:40', endTime: '09:00' },
      { id: 'f3', title: '저녁 스트레칭', category: 'exercise', startTime: '21:30', endTime: '22:00' }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
