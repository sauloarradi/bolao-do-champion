# Bolão do Champion — Top 4 com Login 1

Esta entrega adiciona login obrigatório por e-mail/senha antes de acessar o sistema.

## O que mudou

- Login obrigatório antes de visualizar apostas, participantes, ranking ou participar.
- Cadastro com nome, e-mail, WhatsApp, chave Pix e senha.
- Cada aposta fica vinculada ao usuário autenticado (`uid`).
- O backend valida o token do Firebase antes de liberar dados públicos e gerar Pix.
- Google Login ainda não foi incluído nesta entrega.

## Variáveis obrigatórias na Vercel

Além das variáveis que você já tinha, adicione:

```env
FIREBASE_WEB_API_KEY=sua_api_key_web_do_firebase
```

Mantenha também:

```env
MERCADO_PAGO_ACCESS_TOKEN=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
ADMIN_PASSWORD=...
API_BASE_URL=https://bolao-do-champion.vercel.app
FRONTEND_ORIGIN=https://sauloarradi.github.io
```

## Firebase Authentication

No Firebase Console, ative:

Authentication → Sign-in method → Email/Password → Enable.

## Deploy

1. Substitua o `index.html` no GitHub Pages.
2. Substitua a pasta `backend` na Vercel.
3. Adicione `FIREBASE_WEB_API_KEY` nas variáveis da Vercel.
4. Faça Redeploy na Vercel.
5. Teste cadastro, login, visualização do sistema e geração de Pix.
