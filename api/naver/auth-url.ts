export default async function handler(_req: any, res: any) {
  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri = process.env.NAVER_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return res.status(200).json({ ok: true, mock: true, message: 'mock mode: NAVER_CLIENT_ID/NAVER_REDIRECT_URI가 없어 연결 상태만 표시합니다.' });
  }
  const state = crypto.randomUUID();
  const url = new URL('https://nid.naver.com/oauth2.0/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);
  return res.status(200).json({ ok: true, mock: false, authUrl: url.toString(), state });
}
