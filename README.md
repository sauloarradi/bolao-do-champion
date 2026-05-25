# Bolão do Champion — Vercel único

Esta versão roda o frontend e o backend no mesmo projeto da Vercel.

## Estrutura

- `index.html` — site
- `api/` — funções serverless da Vercel
- `lib/` — utilitários do backend
- `package.json` — dependências do backend

## Variáveis obrigatórias na Vercel

- `MERCADO_PAGO_ACCESS_TOKEN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WEB_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `API_BASE_URL=https://bolao-do-champion.vercel.app`

## Firebase Authentication

Ative os provedores:

- Email/Password
- Google

Em Authentication > Settings > Authorized domains, adicione:

- `bolao-do-champion.vercel.app`

Se usar outro domínio da Vercel, adicione também esse domínio.

## Deploy

Na Vercel, o Root Directory deve ficar vazio ou `/`.
Não use mais `backend` como Root Directory nesta versão.
