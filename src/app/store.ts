import { create } from 'zustand';
import type { ActivityCategory, ActivityRecord, GoalSettings, IntegrationSettings, Reflection, RoutineTemplate } from '../types';
import { minutesBetween, todayKey } from '../lib/date/time';
import { initDefaults, dbApi } from '../lib/db/indexedDb';

interface LifeState {
  loading: boolean;
  error?: string;
  selectedDate: string;
  records: ActivityRecord[];
  goals?: GoalSettings;
  reflections: Reflection[];
  templates: RoutineTemplate[];
  integrations?: IntegrationSettings;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setDate: (date: string) => void;
  saveRecord: (record: Omit<ActivityRecord, 'id' | 'durationMinutes' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  saveGoals: (goals: GoalSettings) => Promise<void>;
  saveReflection: (reflection: Omit<Reflection, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  saveTemplate: (template: RoutineTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyTemplate: (template: RoutineTemplate, date: string) => Promise<void>;
  saveIntegrations: (settings: IntegrationSettings) => Promise<void>;
  importBackup: (data: Parameters<typeof dbApi.importAll>[0]) => Promise<void>;
  clearAll: () => Promise<void>;
}

const uid = () => crypto.randomUUID();
const stamp = () => new Date().toISOString();

export const useLifeStore = create<LifeState>((set, get) => ({
  loading: true,
  selectedDate: todayKey(),
  records: [],
  reflections: [],
  templates: [],
  async init() {
    try {
      await initDefaults();
      await get().refresh();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '초기화 실패', loading: false });
    }
  },
  async refresh() {
    set({ error: undefined });
    const [records, goals, reflections, templates, integrations] = await Promise.all([
      dbApi.allRecords(),
      dbApi.goals(),
      dbApi.allReflections(),
      dbApi.allTemplates(),
      dbApi.integrations()
    ]);
    set({ records, goals, reflections, templates, integrations, loading: false });
  },
  setDate(date) {
    set({ selectedDate: date });
  },
  async saveRecord(input) {
    const now = stamp();
    const existing = input.id ? get().records.find((record) => record.id === input.id) : undefined;
    const record: ActivityRecord = {
      ...input,
      id: input.id ?? uid(),
      durationMinutes: minutesBetween(input.startTime, input.endTime),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    await dbApi.saveRecord(record);
    await get().refresh();
  },
  async deleteRecord(id) {
    await dbApi.deleteRecord(id);
    await get().refresh();
  },
  async saveGoals(goals) {
    await dbApi.saveGoals({ ...goals, updatedAt: stamp() });
    await get().refresh();
  },
  async saveReflection(input) {
    const now = stamp();
    const existing = input.id ? get().reflections.find((reflection) => reflection.id === input.id) : undefined;
    await dbApi.saveReflection({ ...input, id: input.id ?? uid(), createdAt: existing?.createdAt ?? now, updatedAt: now });
    await get().refresh();
  },
  async saveTemplate(template) {
    await dbApi.saveTemplate({ ...template, updatedAt: stamp() });
    await get().refresh();
  },
  async deleteTemplate(id) {
    await dbApi.deleteTemplate(id);
    await get().refresh();
  },
  async applyTemplate(template, date) {
    await Promise.all(
      template.items.map((item) =>
        get().saveRecord({
          date,
          category: item.category as ActivityCategory,
          title: item.title,
          startTime: item.startTime,
          endTime: item.endTime,
          memo: `${template.name}에서 적용`
        })
      )
    );
    await get().refresh();
  },
  async saveIntegrations(settings) {
    await dbApi.saveIntegrations({ ...settings, updatedAt: stamp() });
    await get().refresh();
  },
  async importBackup(data) {
    await dbApi.importAll(data);
    await get().refresh();
  },
  async clearAll() {
    await dbApi.clearAll();
    await get().refresh();
  }
}));
