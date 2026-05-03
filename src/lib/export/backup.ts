import type { LifeBackup } from '../../types';
import { dbApi } from '../db/indexedDb';

export async function createBackup(): Promise<LifeBackup> {
  return {
    exportedAt: new Date().toISOString(),
    records: await dbApi.allRecords(),
    goals: await dbApi.goals(),
    reflections: await dbApi.allReflections(),
    templates: await dbApi.allTemplates(),
    integrations: await dbApi.integrations()
  };
}

export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): LifeBackup {
  const data = JSON.parse(text) as LifeBackup;
  if (!data.records || !data.goals || !data.reflections || !data.templates || !data.integrations) {
    throw new Error('백업 파일 형식이 올바르지 않습니다.');
  }
  return data;
}
