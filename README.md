# Bolão do Champion - Top 4

Versão com:
- Palpite de Top 4: campeão, vice, 3º e 4º lugar.
- Valor da aposta: R$ 50.
- Mercado Pago via backend Vercel.
- Firebase Admin no backend.
- Painel admin com confirmação manual de pagamento.
- Declaração do resultado oficial e cálculo automático de pontos.

## Variáveis na Vercel

Configure no projeto da Vercel:

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
FIREBASE_PROJECT_ID=bolao-do-champion
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@bolao-do-champion.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
API_BASE_URL=https://bolao-do-champion.vercel.app
ADMIN_PASSWORD=Bolao@2026
FRONTEND_ORIGIN=https://sauloarradi.github.io
DEFAULT_PAYER_EMAIL=comprador@email.com
```

Depois de alterar variáveis, faça Redeploy.

## Estrutura

- `index.html`: subir no GitHub Pages.
- `backend/`: publicar na Vercel com Root Directory = `backend`.

## Pontuação

- Campeão correto: 100 pontos
- Vice correto: 70 pontos
- 3º correto: 50 pontos
- 4º correto: 30 pontos
- Seleção no Top 4 em posição errada: 15 pontos

## Testes

1. Acesse `/api/public-data` na Vercel.
2. Suba o `index.html` no GitHub Pages.
3. Faça uma aposta teste com 4 seleções diferentes.
4. Confira se o Pix gerado é de R$ 50.
5. Acesse admin com `ADMIN_PASSWORD`.
6. Declare o Top 4 oficial e confira o ranking.
