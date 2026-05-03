export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 지원합니다.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const token = body.token;
  const databaseId = body.databaseId;
  if (!token || !databaseId) {
    return res.status(200).json({ ok: true, mock: true, message: 'mock mode: 토큰 또는 DB ID가 없어도 화면 흐름은 동작합니다.' });
  }
  try {
    const response = await fetch(`${process.env.NOTION_API_BASE_URL || 'https://api.notion.com/v1'}/databases/${databaseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28'
      }
    });
    return res.status(response.ok ? 200 : 400).json({ ok: response.ok, mock: false, message: response.ok ? 'Notion 연결 성공' : 'Notion 연결 실패' });
  } catch {
    return res.status(200).json({ ok: true, mock: true, message: 'mock mode: 현재 환경에서 Notion API 호출을 건너뜁니다.' });
  }
}
