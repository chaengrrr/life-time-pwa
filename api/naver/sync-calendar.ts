const syncable = new Set(['study', 'exercise', 'meal', 'sleep']);

function toNaverEvent(record: any) {
  return {
    title: `[${record.category}] ${record.title}`,
    start: `${record.date}T${record.startTime}:00`,
    end: `${record.date}T${record.endTime}:00`,
    description: `${record.memo || ''}\n생활기록 앱에서 생성됨`
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'POST만 지원합니다.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const selected = new Set(body.settings?.syncCategories || ['study', 'exercise', 'meal', 'sleep']);
  const events = (body.records || []).filter((record: any) => syncable.has(record.category) && selected.has(record.category)).map(toNaverEvent);
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    return res.status(200).json({ ok: true, mock: true, synced: events.length, events, message: 'mock mode: 네이버 캘린더 이벤트 변환만 수행했습니다.' });
  }
  // TODO: 네이버 캘린더 API의 실제 일정 생성 endpoint와 토큰 저장소가 확정되면 이곳에서 events를 전송합니다.
  return res.status(200).json({ ok: true, mock: true, synced: events.length, message: 'TODO: 실제 네이버 캘린더 일정 생성 호출부 연결 필요' });
}
