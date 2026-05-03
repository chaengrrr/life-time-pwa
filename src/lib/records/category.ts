import type { ActivityCategory } from '../../types';

export const categoryLabels: Record<ActivityCategory, string> = {
  wake: '기상',
  sleep: '수면',
  exercise: '운동',
  study: '공부',
  meal: '식사',
  rest: '휴식',
  free: '자유'
};

export const categoryColors: Record<ActivityCategory, string> = {
  wake: 'bg-amber-100 text-amber-900 border-amber-200',
  sleep: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  exercise: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  study: 'bg-sky-100 text-sky-900 border-sky-200',
  meal: 'bg-rose-100 text-rose-900 border-rose-200',
  rest: 'bg-violet-100 text-violet-900 border-violet-200',
  free: 'bg-slate-100 text-slate-900 border-slate-200'
};

export const chartColors: Record<ActivityCategory, string> = {
  wake: '#d97706',
  sleep: '#4f46e5',
  exercise: '#059669',
  study: '#0284c7',
  meal: '#e11d48',
  rest: '#7c3aed',
  free: '#475569'
};
