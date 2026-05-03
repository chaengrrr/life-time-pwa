export default async function handler(_req: any, res: any) {
  const configured = Boolean(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET && process.env.NAVER_REDIRECT_URI);
  return res.status(200).json({
    ok: true,
    mock: !configured,
    message: configured ? '네이버 OAuth 환경변수가 설정되어 있습니다.' : 'mock mode: 네이버 OAuth 환경변수가 없습니다.'
  });
}
