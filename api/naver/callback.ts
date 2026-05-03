export default async function handler(req: any, res: any) {
  const code = req.query?.code;
  const state = req.query?.state;
  if (!code) return res.status(400).json({ ok: false, message: 'OAuth code가 없습니다.' });
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(200).json({ ok: true, mock: true, code, state, message: 'mock mode: client secret이 없어 토큰 교환을 생략합니다.' });
  }
  const tokenUrl = new URL('https://nid.naver.com/oauth2.0/token');
  tokenUrl.searchParams.set('grant_type', 'authorization_code');
  tokenUrl.searchParams.set('client_id', clientId);
  tokenUrl.searchParams.set('client_secret', clientSecret);
  tokenUrl.searchParams.set('code', code);
  tokenUrl.searchParams.set('state', state || '');
  const token = await fetch(tokenUrl).then((r) => r.json());
  // TODO: access_token/refresh_token은 브라우저가 아니라 서버 저장소에 암호화해 보관해야 합니다.
  return res.status(200).json({ ok: true, mock: false, token });
}
