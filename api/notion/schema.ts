export interface NotionSyncRecord {
  date: string;
  category: string;
  title: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  memo: string;
  lifeScore?: number;
  reflection?: string;
}

export function toNotionProperties(record: NotionSyncRecord) {
  return {
    날짜: { date: { start: record.date } },
    카테고리: { select: { name: record.category } },
    제목: { title: [{ text: { content: record.title } }] },
    '시작 시간': { rich_text: [{ text: { content: record.startTime } }] },
    '종료 시간': { rich_text: [{ text: { content: record.endTime } }] },
    '소요 시간': { number: record.durationMinutes },
    메모: { rich_text: [{ text: { content: record.memo || '' } }] },
    '생활 점수': { number: record.lifeScore ?? 0 },
    회고: { rich_text: [{ text: { content: record.reflection || '' } }] }
  };
}
