import type { ActivityCategory } from '../../types';

export const categoryLabels: Record<ActivityCategory, string> = {
  wake: '기상',
  sleep: '수면',
  exercise: '운동',
  study: '공부',
  selfDevelopment: '자기계발',
  meal: '식사',
  rest: '휴식',
  free: '자유'
};

export const categoryColors: Record<ActivityCategory, string> = {
  wake: 'bg-slate-50 text-slate-700 border-slate-200',
  sleep: 'bg-blue-50 text-blue-700 border-blue-100',
  exercise: 'bg-slate-100 text-slate-800 border-slate-200',
  study: 'bg-blue-50 text-blue-700 border-blue-100',
  selfDevelopment: 'bg-blue-50 text-blue-700 border-blue-100',
  meal: 'bg-slate-50 text-slate-700 border-slate-200',
  rest: 'bg-slate-50 text-slate-600 border-slate-200',
  free: 'bg-white text-slate-700 border-slate-200'
};

export const chartColors: Record<ActivityCategory, string> = {
  wake: '#94a3b8',
  sleep: '#2563eb',
  exercise: '#64748b',
  study: '#3b82f6',
  selfDevelopment: '#60a5fa',
  meal: '#cbd5e1',
  rest: '#e2e8f0',
  free: '#475569'
};
