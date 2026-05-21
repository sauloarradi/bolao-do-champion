# Bolão do Champion - Copa do Mundo 2026

Este pacote já está separado em:

- `index.html`: site estático para publicar no GitHub Pages.
- `backend/`: API para publicar na Vercel.

## 1. Publicar a API na Vercel

1. Crie um novo repositório no GitHub com a pasta `backend` ou publique o projeto completo e, na Vercel, selecione `backend` como Root Directory.
2. Na Vercel, adicione as variáveis de ambiente do arquivo `backend/.env.example`.
3. Faça deploy.
4. Copie a URL gerada, por exemplo:

```txt
https://bolao-do-champion-api.vercel.app
```

## 2. Configurar o Mercado Pago

No Mercado Pago, pegue o `Access Token` da sua aplicação e coloque na Vercel:

```txt
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
```

Também configure o webhook, se for configurar manualmente no painel:

```txt
https://sua-api.vercel.app/api/webhook-mercadopago
```

O backend também envia `notification_url` ao criar o pagamento.

## 3. Configurar Firebase Admin

No Firebase Console:

1. Vá em Configurações do projeto.
2. Contas de serviço.
3. Gerar nova chave privada.
4. Copie os dados para as variáveis da Vercel:

```txt
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

A `FIREBASE_PRIVATE_KEY` deve manter os `\n` ou estar entre aspas.

## 4. Configurar o front

No arquivo `index.html`, troque:

```js
const API_BASE_URL = 'https://COLE-AQUI-SUA-API-VERCEL.vercel.app';
```

pela URL real da sua API na Vercel.

Depois publique o `index.html` no GitHub Pages.

## 5. Sobre o alerta do GitHub

A versão antiga colocava a configuração Firebase Web no HTML. Nesta versão, o HTML não usa Firebase diretamente. O Firebase fica somente no backend, com credenciais em variáveis de ambiente da Vercel.

Mesmo assim, se a chave antiga ficou no histórico do GitHub, o alerta pode continuar aparecendo. Nesse caso:

1. Restrinja ou revogue a chave antiga no Google Cloud/Firebase.
2. Faça uma nova chave se necessário.
3. Depois marque o alerta do GitHub como resolvido.

## 6. Regras do Firestore

Como agora somente o backend acessa o Firestore com Firebase Admin, você pode deixar as regras do Firestore fechadas para cliente web:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 7. Observações importantes

- O `MERCADO_PAGO_ACCESS_TOKEN` nunca deve ir para o GitHub.
- A senha admin fica na Vercel em `ADMIN_PASSWORD`, não no HTML.
- A chave Pix do vencedor ainda é coletada, mas só aparece na área admin.
- O público vê apenas nome, seleção e status de pagamento.
