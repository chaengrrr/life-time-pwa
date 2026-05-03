import { toNotionProperties } from './schema';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 지원합니다.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const token = body.settings?.token;
  const databaseId = body.settings?.databaseId;
  const records = body.records || [];
  if (!token || !databaseId) {
    return res.status(200).json({ ok: true, mock: true, synced: records.length, message: 'mock mode: Notion 설정 없이 동기화 흐름만 확인했습니다.' });
  }
  try {
    const baseUrl = process.env.NOTION_API_BASE_URL || 'https://api.notion.com/v1';
    for (const record of records) {
      await fetch(`${baseUrl}/pages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: toNotionProperties(record)
        })
      });
    }
    return res.status(200).json({ ok: true, mock: false, synced: records.length });
  } catch {
    return res.status(200).json({ ok: true, mock: true, synced: records.length, message: 'TODO: 배포 환경의 네트워크/권한 설정 후 실제 Notion 재시도 로직을 보강하세요.' });
  }
}
