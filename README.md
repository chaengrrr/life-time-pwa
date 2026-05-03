# 생활기록 시간관리 PWA

React, TypeScript, Vite 기반의 시간관리/생활기록 PWA입니다. 기록, 목표, 회고, 루틴, 리포트 데이터는 IndexedDB에 저장됩니다.

## 로컬 실행

```bash
npm install
npm run dev:local
```

앱 주소: http://127.0.0.1:5175

## 빌드 확인

```bash
npm run build
npm audit
```

## Vercel 배포

Vercel에서 GitHub 저장소를 Import하면 됩니다.

- Framework Preset: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

`vercel.json`에 같은 설정이 들어 있습니다.

## 환경변수

Vercel Project Settings > Environment Variables에 `.env.example` 값을 기준으로 등록합니다.

```env
VITE_APP_NAME=생활기록
NOTION_API_BASE_URL=https://api.notion.com/v1
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=
NAVER_API_BASE_URL=https://openapi.naver.com
```

Notion과 네이버 캘린더 연동은 API 키가 없어도 mock mode로 동작합니다. 실제 연동을 켤 때는 Vercel 환경변수에 값을 등록한 뒤 재배포하세요.
