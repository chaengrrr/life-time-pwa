import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  BarChart3,
  CalendarDays,
  Check,
  Clock,
  Database,
  FileDown,
  Home,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Settings,
  Sun,
  Trash2
} from 'lucide-react';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useLifeStore } from './store';
import '../styles.css';
import type { ActivityCategory, ActivityRecord, Reflection, RoutineTemplate } from '../types';
import { calculateLifeScore } from '../lib/score/lifeScore';
import { chartColors, categoryColors, categoryLabels } from '../lib/records/category';
import { createBackup, downloadJson, parseBackup } from '../lib/export/backup';
import { dateKeysBetween, inDateRange, minutesToHours, monthRange, nowTime, sleepMinutesForDay, timeToMinutes, todayKey, weekRange } from '../lib/date/time';

type Tab = 'dashboard' | 'records' | 'reports' | 'templates' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: '대시보드', icon: Home },
  { id: 'records', label: '기록', icon: Plus },
  { id: 'reports', label: '리포트', icon: BarChart3 },
  { id: 'templates', label: '루틴', icon: CalendarDays },
  { id: 'settings', label: '설정', icon: Settings }
];

const quickButtons: { label: string; category: ActivityCategory; title: string; minutes: number }[] = [
  { label: '기상', category: 'wake', title: '기상', minutes: 5 },
  { label: '운동 시작', category: 'exercise', title: '운동', minutes: 30 },
  { label: '운동 종료', category: 'exercise', title: '운동 완료', minutes: 1 },
  { label: '공부 시작', category: 'study', title: '공부', minutes: 60 },
  { label: '공부 종료', category: 'study', title: '공부 완료', minutes: 1 },
  { label: '아침', category: 'meal', title: '아침 식사', minutes: 20 },
  { label: '점심', category: 'meal', title: '점심 식사', minutes: 30 },
  { label: '저녁', category: 'meal', title: '저녁 식사', minutes: 30 },
  { label: '휴식', category: 'rest', title: '휴식', minutes: 20 },
  { label: '취침', category: 'sleep', title: '수면', minutes: 420 }
];

function addMinutesToTime(time: string, minutes: number) {
  const total = (timeToMinutes(time) + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function formatGoalTime(time: string) {
  const minutes = timeToMinutes(time);
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  return `${period} ${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function useDerived() {
  const store = useLifeStore();
  return useMemo(() => {
    const goals = store.goals;
    const dayRecords = store.records.filter((record) => record.date === store.selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
    const { start: weekStart, end: weekEnd } = weekRange(parseISO(store.selectedDate));
    const { start: monthStart, end: monthEnd } = monthRange(parseISO(store.selectedDate));
    const weekRecords = store.records.filter((record) => inDateRange(record.date, weekStart, weekEnd));
    const monthRecords = store.records.filter((record) => inDateRange(record.date, monthStart, monthEnd));
    const score = goals ? calculateLifeScore(store.records, goals, store.reflections, parseISO(store.selectedDate)) : undefined;
    return { ...store, dayRecords, weekRecords, monthRecords, score };
  }, [store]);
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</section>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="min-h-24">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink dark:text-white">{value}</p>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">{text}</div>;
}

function Dashboard() {
  const { records, dayRecords, weekRecords, goals, score, reflections, selectedDate } = useDerived();
  const recentKeys = dateKeysBetween(new Date(Date.now() - 6 * 86400000), new Date());
  const todayStudy = dayRecords.filter((r) => r.category === 'study').reduce((s, r) => s + r.durationMinutes, 0);
  const todayExercise = dayRecords.filter((r) => r.category === 'exercise').reduce((s, r) => s + r.durationMinutes, 0);
  const todaySleep = sleepMinutesForDay(dayRecords);
  const meals = dayRecords.filter((r) => r.category === 'meal').length;
  const weekStudy = weekRecords.filter((r) => r.category === 'study').reduce((s, r) => s + r.durationMinutes, 0);
  const weekExercise = weekRecords.filter((r) => r.category === 'exercise').reduce((s, r) => s + r.durationMinutes, 0);
  const goalRate = goals ? Math.round(((weekStudy / goals.weeklyStudyMinutes + weekExercise / goals.weeklyExerciseMinutes) / 2) * 100) : 0;
  const lineData = recentKeys.map((date) => {
    const day = records.filter((r) => r.date === date);
    return {
      date: format(parseISO(date), 'M/d'),
      공부: Math.round(day.filter((r) => r.category === 'study').reduce((s, r) => s + r.durationMinutes, 0) / 60),
      운동: Math.round(day.filter((r) => r.category === 'exercise').reduce((s, r) => s + r.durationMinutes, 0) / 60),
      수면: Math.round(sleepMinutesForDay(day) / 60)
    };
  });
  const pieData = Object.keys(categoryLabels)
    .map((category) => ({
      name: categoryLabels[category as ActivityCategory],
      category: category as ActivityCategory,
      value: dayRecords.filter((r) => r.category === category).reduce((s, r) => s + r.durationMinutes, 0)
    }))
    .filter((item) => item.value > 0);
  const reflectionDone = reflections.some((r) => r.type === 'daily' && r.date === selectedDate);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="생활 점수" value={`${score?.total ?? 0}점`} />
        <Stat label="목표 달성률" value={`${Math.min(goalRate, 100)}%`} />
        <Stat label="공부 시간" value={minutesToHours(todayStudy)} />
        <Stat label="운동 시간" value={minutesToHours(todayExercise)} />
        <Stat label="수면 시간" value={minutesToHours(todaySleep)} />
        <Stat label="식사/회고" value={`${meals}회 · ${reflectionDone ? '완료' : '미작성'}`} />
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">최근 7일</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="공부" stroke="#0284c7" strokeWidth={2} />
              <Line type="monotone" dataKey="운동" stroke="#059669" strokeWidth={2} />
              <Line type="monotone" dataKey="수면" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">오늘 시간 분포</h2>
        {pieData.length ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={82} label>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={chartColors[entry.category]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => minutesToHours(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty text="오늘 기록이 아직 없습니다." />
        )}
      </Card>
    </div>
  );
}

function RecordForm({ editing, onDone }: { editing?: ActivityRecord; onDone: () => void }) {
  const { selectedDate, saveRecord } = useLifeStore();
  const [form, setForm] = useState({
    date: editing?.date ?? selectedDate,
    category: editing?.category ?? 'study',
    title: editing?.title ?? '',
    startTime: editing?.startTime ?? nowTime(),
    endTime: editing?.endTime ?? addMinutesToTime(nowTime(), 30),
    memo: editing?.memo ?? ''
  });
  return (
    <Card>
      <div className="grid gap-3">
        <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ActivityCategory })}>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <input className="input" placeholder="제목" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <textarea className="input min-h-20" placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
        <button
          className="primary"
          onClick={async () => {
            await saveRecord({ ...form, id: editing?.id, title: form.title || categoryLabels[form.category as ActivityCategory] });
            onDone();
          }}
        >
          <Check size={18} /> 저장
        </button>
      </div>
    </Card>
  );
}

function Timeline() {
  const { dayRecords } = useDerived();
  const overlaps = dayRecords.filter((record, index) => {
    const next = dayRecords[index + 1];
    return next && timeToMinutes(record.endTime) > timeToMinutes(next.startTime);
  });
  const gaps = dayRecords.slice(0, -1).map((record, index) => {
    const next = dayRecords[index + 1];
    const gap = timeToMinutes(next.startTime) - timeToMinutes(record.endTime);
    return gap > 15 ? `${record.endTime}-${next.startTime} 빈 시간 ${minutesToHours(gap)}` : '';
  }).filter(Boolean);

  return (
    <Card>
      <h2 className="mb-3 font-semibold">일간 타임라인</h2>
      {overlaps.length > 0 && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">겹치는 기록이 있습니다. 시간을 확인하세요.</p>}
      {dayRecords.length === 0 ? <Empty text="기록을 추가하면 하루 흐름이 표시됩니다." /> : (
        <div className="space-y-2">
          {dayRecords.map((record) => (
            <div key={record.id} className={`rounded-lg border p-3 ${categoryColors[record.category]}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{record.title}</p>
                  <p className="text-sm">{record.startTime} - {record.endTime} · {minutesToHours(record.durationMinutes)}</p>
                </div>
                <span className="text-xs">{categoryLabels[record.category]}</span>
              </div>
              {record.memo && <p className="mt-2 text-sm opacity-80">{record.memo}</p>}
            </div>
          ))}
          {gaps.length > 0 && <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{gaps.join(' · ')}</div>}
        </div>
      )}
    </Card>
  );
}

function RecordsPage() {
  const { selectedDate, setDate, saveRecord, deleteRecord } = useLifeStore();
  const { dayRecords } = useDerived();
  const [editing, setEditing] = useState<ActivityRecord | undefined>();
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <Card>
        <input className="input" type="date" value={selectedDate} onChange={(e) => setDate(e.target.value)} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {quickButtons.map((button) => (
            <button
              key={button.label}
              className="secondary justify-center"
              onClick={() => {
                const startTime = nowTime();
                void saveRecord({
                  date: selectedDate,
                  category: button.category,
                  title: button.title,
                  startTime,
                  endTime: addMinutesToTime(startTime, button.minutes),
                  memo: '빠른 입력'
                });
              }}
            >
              <Clock size={16} /> {button.label}
            </button>
          ))}
        </div>
      </Card>
      <Timeline />
      <button className="primary w-full justify-center" onClick={() => { setEditing(undefined); setOpen(!open); }}>
        <Plus size={18} /> 기록 직접 추가
      </button>
      {open && <RecordForm editing={editing} onDone={() => { setOpen(false); setEditing(undefined); }} />}
      <Card>
        <h2 className="mb-3 font-semibold">수정/삭제</h2>
        {dayRecords.length === 0 ? <Empty text="수정할 기록이 없습니다." /> : dayRecords.map((record) => (
          <div key={record.id} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
            <button className="text-left" onClick={() => { setEditing(record); setOpen(true); }}>
              <p className="font-medium">{record.title}</p>
              <p className="text-sm text-slate-500">{record.startTime}-{record.endTime}</p>
            </button>
            <button className="icon" type="button" onClick={() => void deleteRecord(record.id)} aria-label="삭제"><Trash2 size={18} /></button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ReportsPage() {
  const { weekRecords, monthRecords, goals, selectedDate, score } = useDerived();
  if (!goals) return null;
  const sum = (items: ActivityRecord[], category: ActivityCategory) => items.filter((r) => r.category === category).reduce((s, r) => s + r.durationMinutes, 0);
  const avgTime = (items: ActivityRecord[], category: ActivityCategory) => {
    const times = items.filter((r) => r.category === category).map((r) => timeToMinutes(r.startTime));
    if (!times.length) return '-';
    const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
    return `${String(Math.floor(avg / 60)).padStart(2, '0')}:${String(avg % 60).padStart(2, '0')}`;
  };
  const weeklyRate = Math.round(((sum(weekRecords, 'study') / goals.weeklyStudyMinutes + sum(weekRecords, 'exercise') / goals.weeklyExerciseMinutes) / 2) * 100);
  const best = weeklyRate >= 80 ? '주간 활동 목표' : weekRecords.filter((r) => r.category === 'meal').length >= goals.dailyMealCount * 4 ? '식사 기록' : '기록 꾸준함';
  const weak = sum(weekRecords, 'exercise') < goals.weeklyExerciseMinutes ? '운동 목표' : sleepMinutesForDay(weekRecords) / 7 < goals.minimumSleepMinutes ? '수면 시간' : '회고 작성';
  const comment = weak === '운동 목표'
    ? '운동 목표 달성률이 낮습니다. 다음 주에는 짧은 운동부터 시작해보세요.'
    : '이번 주는 공부 시간이 안정적이지만 수면 시간이 불규칙합니다.';
  const monthKeys = dateKeysBetween(monthRange(parseISO(selectedDate)).start, monthRange(parseISO(selectedDate)).end);
  const byWeekday = monthKeys.map((key) => ({ key, count: monthRecords.filter((r) => r.date === key).length }));
  const most = byWeekday.reduce((a, b) => (a.count >= b.count ? a : b), byWeekday[0]);
  const least = byWeekday.reduce((a, b) => (a.count <= b.count ? a : b), byWeekday[0]);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 font-semibold">주간 리포트</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="공부 총합" value={minutesToHours(sum(weekRecords, 'study'))} />
          <Stat label="운동 총합" value={minutesToHours(sum(weekRecords, 'exercise'))} />
          <Stat label="평균 기상" value={avgTime(weekRecords, 'wake')} />
          <Stat label="평균 취침" value={avgTime(weekRecords, 'sleep')} />
          <Stat label="평균 수면" value={minutesToHours(Math.round(sleepMinutesForDay(weekRecords) / 7))} />
          <Stat label="식사 횟수" value={`${sum(weekRecords, 'meal') ? weekRecords.filter((r) => r.category === 'meal').length : 0}회`} />
        </div>
        <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">목표 달성률 {Math.min(weeklyRate, 100)}% · 가장 잘 지킨 목표: {best} · 부족한 목표: {weak}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{comment}</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">월간 리포트 카드</h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="월 공부" value={minutesToHours(sum(monthRecords, 'study'))} />
          <Stat label="월 운동" value={minutesToHours(sum(monthRecords, 'exercise'))} />
          <Stat label="월 수면" value={minutesToHours(sleepMinutesForDay(monthRecords))} />
          <Stat label="월 생활 점수" value={`${score?.total ?? 0}점`} />
          <Stat label="평균 기상" value={avgTime(monthRecords, 'wake')} />
          <Stat label="평균 취침" value={avgTime(monthRecords, 'sleep')} />
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">가장 규칙적인 날짜는 {most?.key ?? '-'}, 가장 흐트러진 날짜는 {least?.key ?? '-'}입니다.</p>
      </Card>
    </div>
  );
}

function TemplatesPage() {
  const { templates, selectedDate, applyTemplate, saveTemplate, deleteTemplate } = useLifeStore();
  const [name, setName] = useState('');
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 font-semibold">루틴 템플릿</h2>
        <div className="space-y-3">
          {templates.map((template) => (
            <div key={template.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{template.name}</p>
                  <p className="text-sm text-slate-500">{template.items.length}개 계획</p>
                </div>
                <div className="flex gap-2">
                  <button className="icon" type="button" onClick={() => void applyTemplate(template, selectedDate)} aria-label="적용"><Check size={18} /></button>
                  {!['weekday', 'weekend', 'exam', 'exercise-focus'].includes(template.id) && <button className="icon" type="button" onClick={() => void deleteTemplate(template.id)} aria-label="삭제"><Trash2 size={18} /></button>}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {template.items.map((item) => <span key={item.id} className={`rounded-full border px-2 py-1 text-xs ${categoryColors[item.category]}`}>{item.startTime} {item.title}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">직접 만들기</h2>
        <input className="input" placeholder="템플릿 이름" value={name} onChange={(e) => setName(e.target.value)} />
        <button
          className="primary mt-3 w-full justify-center"
          onClick={() => {
            if (!name.trim()) return;
            const now = new Date().toISOString();
            const template: RoutineTemplate = {
              id: crypto.randomUUID(),
              name,
              items: [{ id: crypto.randomUUID(), title: '새 계획', category: 'study', startTime: '09:00', endTime: '10:00' }],
              createdAt: now,
              updatedAt: now
            };
            void saveTemplate(template);
            setName('');
          }}
        >
          <Plus size={18} /> 기본 항목으로 생성
        </button>
      </Card>
    </div>
  );
}

function ReflectionBox() {
  const { selectedDate, reflections, saveReflection } = useLifeStore();
  const existing = reflections.find((r) => r.type === 'daily' && r.date === selectedDate);
  const [form, setForm] = useState({ good: existing?.good ?? '', regret: existing?.regret ?? '', tomorrow: existing?.tomorrow ?? '' });
  useEffect(() => setForm({ good: existing?.good ?? '', regret: existing?.regret ?? '', tomorrow: existing?.tomorrow ?? '' }), [existing?.id]);
  return (
    <Card>
      <h2 className="mb-3 font-semibold">하루 회고</h2>
      <div className="grid gap-2">
        <textarea className="input" placeholder="오늘 잘한 점" value={form.good} onChange={(e) => setForm({ ...form, good: e.target.value })} />
        <textarea className="input" placeholder="아쉬운 점" value={form.regret} onChange={(e) => setForm({ ...form, regret: e.target.value })} />
        <textarea className="input" placeholder="내일 할 일" value={form.tomorrow} onChange={(e) => setForm({ ...form, tomorrow: e.target.value })} />
        <button className="primary" onClick={() => void saveReflection({ ...form, id: existing?.id, type: 'daily', date: selectedDate })}><Check size={18} /> 회고 저장</button>
      </div>
    </Card>
  );
}

function TimeGoalControl({
  label,
  value,
  presets,
  onChange
}: {
  label: string;
  value: string;
  presets: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink dark:text-white">{formatGoalTime(value)}</p>
        </div>
        <div className="flex gap-2">
          <button className="stepper" type="button" onClick={() => onChange(addMinutesToTime(value, -15))} aria-label={`${label} 15분 앞당기기`}>
            <Minus size={18} />
          </button>
          <button className="stepper" type="button" onClick={() => onChange(addMinutesToTime(value, 15))} aria-label={`${label} 15분 늦추기`}>
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            className={`chip ${preset === value ? 'chip-active' : ''}`}
            type="button"
            onClick={() => onChange(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberGoalControl({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <button className="stepper" type="button" onClick={() => onChange(clampNumber(value - step, min, max))} aria-label={`${label} 줄이기`}>
          <Minus size={18} />
        </button>
        <p className="min-w-0 text-center text-2xl font-semibold text-ink dark:text-white">
          {value}
          <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">{unit}</span>
        </p>
        <button className="stepper" type="button" onClick={() => onChange(clampNumber(value + step, min, max))} aria-label={`${label} 늘리기`}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function SettingsPage() {
  const { goals, saveGoals, integrations, saveIntegrations, importBackup, clearAll, records, reflections } = useLifeStore();
  const [message, setMessage] = useState('');
  if (!goals || !integrations) return null;
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 font-semibold">목표 설정</h2>
        <div className="grid gap-3">
          <TimeGoalControl
            label="목표 기상"
            value={goals.wakeTime}
            presets={['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30']}
            onChange={(wakeTime) => void saveGoals({ ...goals, wakeTime })}
          />
          <TimeGoalControl
            label="목표 취침"
            value={goals.sleepTime}
            presets={['21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00']}
            onChange={(sleepTime) => void saveGoals({ ...goals, sleepTime })}
          />
          <NumberGoalControl
            label="주간 운동 목표"
            value={goals.weeklyExerciseMinutes}
            unit="분"
            step={30}
            min={0}
            max={2000}
            onChange={(weeklyExerciseMinutes) => void saveGoals({ ...goals, weeklyExerciseMinutes })}
          />
          <NumberGoalControl
            label="주간 공부 목표"
            value={goals.weeklyStudyMinutes}
            unit="분"
            step={60}
            min={0}
            max={6000}
            onChange={(weeklyStudyMinutes) => void saveGoals({ ...goals, weeklyStudyMinutes })}
          />
          <NumberGoalControl
            label="하루 식사 목표"
            value={goals.dailyMealCount}
            unit="회"
            step={1}
            min={0}
            max={6}
            onChange={(dailyMealCount) => void saveGoals({ ...goals, dailyMealCount })}
          />
          <NumberGoalControl
            label="최소 수면"
            value={goals.minimumSleepMinutes}
            unit="분"
            step={30}
            min={0}
            max={900}
            onChange={(minimumSleepMinutes) => void saveGoals({ ...goals, minimumSleepMinutes })}
          />
        </div>
      </Card>
      <ReflectionBox />
      <Card>
        <h2 className="mb-3 font-semibold">Notion 연동</h2>
        <p className="mb-3 text-xs text-amber-700">임시로 로컬에 토큰을 저장합니다. 실제 서비스에서는 사용자 계정/서버 저장소로 옮겨야 합니다.</p>
        <input className="input mb-2" placeholder="Notion Integration Token" value={integrations.notion.token} onChange={(e) => void saveIntegrations({ ...integrations, notion: { ...integrations.notion, token: e.target.value } })} />
        <input className="input mb-2" placeholder="Notion Database ID" value={integrations.notion.databaseId} onChange={(e) => void saveIntegrations({ ...integrations, notion: { ...integrations.notion, databaseId: e.target.value } })} />
        <div className="grid grid-cols-2 gap-2">
          <button className="secondary" onClick={async () => { const r = await fetch('/api/notion/test', { method: 'POST', body: JSON.stringify(integrations.notion) }); setMessage((await r.json()).message); }}><Activity size={16} /> 연결 테스트</button>
          <button className="secondary" onClick={async () => { await fetch('/api/notion/sync', { method: 'POST', body: JSON.stringify({ settings: integrations.notion, records, reflections }) }); await saveIntegrations({ ...integrations, notion: { ...integrations.notion, lastSyncedAt: new Date().toISOString(), status: 'connected' } }); }}><RefreshCw size={16} /> 동기화</button>
        </div>
        <p className="mt-2 text-sm text-slate-500">마지막 동기화: {integrations.notion.lastSyncedAt ?? '-'}</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">네이버 캘린더</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {(['study', 'exercise', 'meal', 'sleep'] as ActivityCategory[]).map((category) => (
            <label key={category} className="rounded-full border px-3 py-1 text-sm">
              <input className="mr-2" type="checkbox" checked={integrations.naver.syncCategories.includes(category)} onChange={(e) => {
                const next = e.target.checked ? [...integrations.naver.syncCategories, category] : integrations.naver.syncCategories.filter((c) => c !== category);
                void saveIntegrations({ ...integrations, naver: { ...integrations.naver, syncCategories: next } });
              }} />
              {categoryLabels[category]}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="secondary" onClick={async () => { const r = await fetch('/api/naver/auth-url'); setMessage((await r.json()).message); await saveIntegrations({ ...integrations, naver: { ...integrations.naver, connected: true } }); }}><CalendarDays size={16} /> 연결</button>
          <button className="secondary" onClick={async () => { await fetch('/api/naver/sync-calendar', { method: 'POST', body: JSON.stringify({ records, settings: integrations.naver }) }); await saveIntegrations({ ...integrations, naver: { ...integrations.naver, lastSyncedAt: new Date().toISOString() } }); }}><RefreshCw size={16} /> 동기화</button>
        </div>
        <p className="mt-2 text-sm text-slate-500">상태: {integrations.naver.connected ? '연결됨(mock)' : '미연결'} · 마지막 동기화: {integrations.naver.lastSyncedAt ?? '-'}</p>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">데이터 관리</h2>
        <div className="grid gap-2">
          <button className="secondary" onClick={async () => downloadJson(await createBackup(), `life-backup-${todayKey()}.json`)}><FileDown size={16} /> JSON 내보내기</button>
          <label className="secondary cursor-pointer"><Database size={16} /> JSON 불러오기<input hidden type="file" accept="application/json" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            await importBackup(parseBackup(await file.text()));
            setMessage('백업을 불러왔습니다.');
          }} /></label>
          <button className="danger" onClick={() => { if (confirm('전체 데이터를 초기화할까요?')) void clearAll(); }}><Trash2 size={16} /> 전체 초기화</button>
        </div>
      </Card>
      {message && <p className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">{message}</p>}
    </div>
  );
}

function App() {
  const { init, loading, error } = useLifeStore();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('life-dark-mode') === 'true');

  useEffect(() => { void init(); }, [init]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('life-dark-mode', String(darkMode));
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-ink dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">생활기록</h1>
            <p className="text-sm text-slate-500">시간관리 · 회고 · 리포트</p>
          </div>
          <button
            className="icon"
            type="button"
            title={darkMode ? '라이트 모드' : '다크 모드'}
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4">
        {loading && <Card>불러오는 중...</Card>}
        {error && <Card className="text-red-600">{error}</Card>}
        {!loading && tab === 'dashboard' && <Dashboard />}
        {!loading && tab === 'records' && <RecordsPage />}
        {!loading && tab === 'reports' && <ReportsPage />}
        {!loading && tab === 'templates' && <TemplatesPage />}
        {!loading && tab === 'settings' && <SettingsPage />}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] pt-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`tab ${tab === id ? 'tab-active' : ''}`} onClick={() => setTab(id)}>
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
