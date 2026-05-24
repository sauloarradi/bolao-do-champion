# Bolão do Champion — Login Google

Entrega pequena: adiciona login com Google ao sistema que já tinha login por e-mail/senha.

## O que mudou

- Botão **Entrar com Google** na tela de login.
- Botão **Criar/entrar com Google** na tela de cadastro.
- Novo endpoint `/api/firebase-config` para entregar a configuração pública do Firebase Auth sem deixar a API key escrita no `index.html`.
- Novo endpoint `/api/auth-google` para validar o token Google/Firebase no backend e criar/atualizar o perfil em `users/{uid}`.
- O login por e-mail/senha continua funcionando.
- O sistema continua bloqueado antes do login.
- Apostas seguem vinculadas ao usuário autenticado.

## Variáveis Vercel necessárias

Além das variáveis anteriores, confirme:

```env
FIREBASE_WEB_API_KEY=...
FIREBASE_AUTH_DOMAIN=bolao-do-champion.firebaseapp.com
```

`FIREBASE_AUTH_DOMAIN` é opcional no código, mas recomendado.

## Firebase Console

Ative o provedor Google:

1. Firebase Console
2. Authentication
3. Sign-in method
4. Google
5. Enable
6. Informe um e-mail de suporte
7. Save

Depois confira os domínios autorizados:

1. Authentication
2. Settings
3. Authorized domains
4. Adicione, se ainda não existir:
   - `sauloarradi.github.io`
   - `bolao-do-champion.vercel.app`

## Deploy

1. Substitua `index.html` no GitHub.
2. Substitua a pasta `backend` no GitHub.
3. Commit/push.
4. Faça redeploy na Vercel.
5. Teste login com e-mail/senha e com Google.
