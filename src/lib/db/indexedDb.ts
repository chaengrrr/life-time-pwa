import { openDB, type DBSchema } from 'idb';
import type { ActivityRecord, GoalSettings, IntegrationSettings, Reflection, RoutineTemplate } from '../../types';
import { defaultGoals, defaultIntegrations, defaultTemplates } from './defaults';

interface LifeDb extends DBSchema {
  records: { key: string; value: ActivityRecord; indexes: { byDate: string } };
  goals: { key: string; value: GoalSettings };
  reflections: { key: string; value: Reflection; indexes: { byDate: string } };
  templates: { key: string; value: RoutineTemplate };
  integrations: { key: string; value: IntegrationSettings };
}

const dbPromise = openDB<LifeDb>('life-time-pwa', 1, {
  upgrade(db) {
    const recordStore = db.createObjectStore('records', { keyPath: 'id' });
    recordStore.createIndex('byDate', 'date');
    db.createObjectStore('goals', { keyPath: 'id' });
    const reflectionStore = db.createObjectStore('reflections', { keyPath: 'id' });
    reflectionStore.createIndex('byDate', 'date');
    db.createObjectStore('templates', { keyPath: 'id' });
    db.createObjectStore('integrations', { keyPath: 'id' });
  }
});

const stores: Array<'records' | 'goals' | 'reflections' | 'templates' | 'integrations'> = [
  'records',
  'goals',
  'reflections',
  'templates',
  'integrations'
];

export async function initDefaults() {
  const db = await dbPromise;
  if (!(await db.get('goals', 'default'))) await db.put('goals', defaultGoals);
  if (!(await db.get('integrations', 'default'))) await db.put('integrations', defaultIntegrations);
  if ((await db.count('templates')) === 0) {
    await Promise.all(defaultTemplates.map((template) => db.put('templates', template)));
  }
}

export const dbApi = {
  async allRecords() {
    return (await dbPromise).getAll('records');
  },
  async recordsByDate(date: string) {
    return (await dbPromise).getAllFromIndex('records', 'byDate', date);
  },
  async saveRecord(record: ActivityRecord) {
    return (await dbPromise).put('records', record);
  },
  async deleteRecord(id: string) {
    return (await dbPromise).delete('records', id);
  },
  async goals() {
    return ((await dbPromise).get('goals', 'default') as Promise<Partial<GoalSettings> | undefined>).then((goal) => ({
      ...defaultGoals,
      ...goal,
      id: 'default' as const
    }));
  },
  async saveGoals(goals: GoalSettings) {
    return (await dbPromise).put('goals', goals);
  },
  async allReflections() {
    return (await dbPromise).getAll('reflections');
  },
  async reflectionsByDate(date: string) {
    return (await dbPromise).getAllFromIndex('reflections', 'byDate', date);
  },
  async saveReflection(reflection: Reflection) {
    return (await dbPromise).put('reflections', reflection);
  },
  async allTemplates() {
    return (await dbPromise).getAll('templates');
  },
  async saveTemplate(template: RoutineTemplate) {
    return (await dbPromise).put('templates', template);
  },
  async deleteTemplate(id: string) {
    return (await dbPromise).delete('templates', id);
  },
  async integrations() {
    return ((await dbPromise).get('integrations', 'default') as Promise<IntegrationSettings | undefined>).then(
      (settings) => settings ?? defaultIntegrations
    );
  },
  async saveIntegrations(settings: IntegrationSettings) {
    return (await dbPromise).put('integrations', settings);
  },
  async clearAll() {
    const db = await dbPromise;
    await Promise.all(stores.map((store) => db.clear(store)));
    await initDefaults();
  },
  async importAll(data: {
    records: ActivityRecord[];
    goals: GoalSettings;
    reflections: Reflection[];
    templates: RoutineTemplate[];
    integrations: IntegrationSettings;
  }) {
    const db = await dbPromise;
    await Promise.all(stores.map((store) => db.clear(store)));
    await Promise.all([
      ...data.records.map((record) => db.put('records', record)),
      db.put('goals', data.goals),
      ...data.reflections.map((reflection) => db.put('reflections', reflection)),
      ...data.templates.map((template) => db.put('templates', template)),
      db.put('integrations', data.integrations)
    ]);
  }
};
