import type { ActivityRecord, GoalSettings, Reflection, ScoreBreakdown } from '../../types';
import { inDateRange, sleepMinutesForDay, timeToMinutes, weekRange } from '../date/time';

const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value));

function closestTimeScore(actual: string | undefined, target: string, max: number) {
  if (!actual) return 0;
  const diff = Math.abs(timeToMinutes(actual) - timeToMinutes(target));
  return clamp(max * (1 - Math.min(diff, 180) / 180), max);
}

export function calculateLifeScore(
  records: ActivityRecord[],
  goals: GoalSettings,
  reflections: Reflection[],
  date = new Date()
): ScoreBreakdown {
  const key = date.toISOString().slice(0, 10);
  const today = records.filter((record) => record.date === key);
  const { start, end } = weekRange(date);
  const week = records.filter((record) => inDateRange(record.date, start, end));
  const wake = today.find((record) => record.category === 'wake')?.startTime;
  const sleep = today.find((record) => record.category === 'sleep')?.startTime;
  const study = week.filter((record) => record.category === 'study').reduce((sum, record) => sum + record.durationMinutes, 0);
  const exercise = week.filter((record) => record.category === 'exercise').reduce((sum, record) => sum + record.durationMinutes, 0);
  const meals = today.filter((record) => record.category === 'meal').length;
  const dailyReflection = reflections.some((reflection) => reflection.type === 'daily' && reflection.date === key);
  const activeDays = new Set(week.map((record) => record.date)).size;
  const sleepToday = sleepMinutesForDay(today);

  // 100점 구성:
  // 수면 규칙성 25점: 목표 취침/기상 시각과 실제 기록의 차이가 작을수록 높고, 최소 수면 시간 미달 시 감점한다.
  // 공부 목표 25점, 운동 목표 20점: 이번 주 누적 시간이 주간 목표에 가까울수록 높다.
  // 식사 기록 10점: 하루 목표 식사 횟수 대비 기록률이다.
  // 회고 10점: 하루 회고 작성 여부다.
  // 기록 꾸준함 10점: 이번 주 기록이 있는 날짜 수를 기준으로 한다.
  const regularity = closestTimeScore(wake, goals.wakeTime, 12.5) + closestTimeScore(sleep, goals.sleepTime, 12.5);
  const sleepPenalty = sleepToday > 0 && sleepToday < goals.minimumSleepMinutes ? 0.75 : 1;
  const sleepRegularity = regularity * sleepPenalty;
  const studyGoal = clamp((study / Math.max(goals.weeklyStudyMinutes, 1)) * 25, 25);
  const exerciseGoal = clamp((exercise / Math.max(goals.weeklyExerciseMinutes, 1)) * 20, 20);
  const mealScore = clamp((meals / Math.max(goals.dailyMealCount, 1)) * 10, 10);
  const reflection = dailyReflection ? 10 : 0;
  const consistency = clamp((activeDays / 7) * 10, 10);
  const total = Math.round(sleepRegularity + studyGoal + exerciseGoal + mealScore + reflection + consistency);

  return {
    sleepRegularity: Math.round(sleepRegularity),
    studyGoal: Math.round(studyGoal),
    exerciseGoal: Math.round(exerciseGoal),
    meals: Math.round(mealScore),
    reflection,
    consistency: Math.round(consistency),
    total
  };
}
