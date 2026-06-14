# Bolão do Champion — pagamento manual

Esta versão roda o frontend e o backend no mesmo projeto da Vercel.

## Mudança desta versão

O fluxo do Mercado Pago foi removido do cadastro de novas apostas. Agora a aposta é registrada como `pending_manual` e o administrador confirma manualmente o pagamento no painel.

O endpoint `api/webhook-mercadopago.js` foi mantido apenas para ignorar notificações antigas do Mercado Pago, sem alterar status de apostas já confirmadas manualmente.

## Estrutura

- `index.html` — site
- `api/` — funções serverless da Vercel
- `lib/` — utilitários do backend
- `package.json` — dependências do backend

## Variáveis obrigatórias na Vercel

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WEB_API_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `API_BASE_URL=https://bolao-do-champion.vercel.app`

## Variáveis que não são mais necessárias

- `MERCADO_PAGO_ACCESS_TOKEN`
- `DEFAULT_PAYER_EMAIL`
- `FRONTEND_ORIGIN`

Elas podem ficar cadastradas na Vercel sem prejudicar, mas não são mais usadas nesta versão.

## Firebase Authentication

Ative os provedores:

- Email/Password
- Google

Em Authentication > Settings > Authorized domains, adicione:

- `bolao-do-champion.vercel.app`

## Deploy

Na Vercel, o Root Directory deve ficar vazio ou `/`.
