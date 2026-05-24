import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

function clean(v) { return String(v || '').trim(); }
function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const name = clean(req.body?.name);
    const email = clean(req.body?.email).toLowerCase();
    const phone = clean(req.body?.phone);
    const pix = clean(req.body?.pix);
    const password = String(req.body?.password || '');

    if (name.length < 3) return res.status(400).json({ error: 'Informe seu nome completo.' });
    if (!validEmail(email)) return res.status(400).json({ error: 'Informe um e-mail válido.' });
    if (phone.length < 8) return res.status(400).json({ error: 'Informe seu WhatsApp.' });
    if (pix.length < 3) return res.status(400).json({ error: 'Informe sua chave Pix.' });
    if (password.length < 6) return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });
    if (!process.env.FIREBASE_WEB_API_KEY) return res.status(500).json({ error: 'FIREBASE_WEB_API_KEY não configurada na Vercel.' });

    const firebaseRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const authData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      const msg = authData?.error?.message === 'EMAIL_EXISTS'
        ? 'Já existe uma conta com esse e-mail.'
        : 'Erro ao criar conta.';
      return res.status(400).json({ error: msg, details: authData?.error?.message });
    }

    const profile = {
      uid: authData.localId,
      name,
      email,
      phone,
      pix,
      provider: 'password',
      createdAt: nowIso(),
      updatedAt: nowIso()
    };

    await getDb().collection('users').doc(authData.localId).set(profile, { merge: true });

    return res.status(200).json({
      idToken: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresIn: authData.expiresIn,
      user: profile
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
