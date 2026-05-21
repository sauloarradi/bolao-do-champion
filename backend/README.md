# API - Bolão do Champion

Endpoints:

- `GET /api/public-data`: lista pública sem chave Pix.
- `GET /api/admin-data`: lista completa, exige header `X-Admin-Password`.
- `POST /api/create-payment`: cria aposta e Pix Mercado Pago.
- `POST /api/webhook-mercadopago`: recebe confirmação do Mercado Pago.
- `POST /api/update-payment-status`: confirmação manual, exige header `X-Admin-Password`.

## Deploy

Publique esta pasta na Vercel e configure as variáveis do `.env.example`.
