import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

function clean(v) { return String(v || '').trim(); }

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const email = clean(req.body?.email).toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) return res.status(400).json({ error: 'Informe e-mail e senha.' });
    if (!process.env.FIREBASE_WEB_API_KEY) return res.status(500).json({ error: 'FIREBASE_WEB_API_KEY não configurada na Vercel.' });

    const firebaseRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_WEB_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true })
    });
    const authData = await firebaseRes.json();

    if (!firebaseRes.ok) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.', details: authData?.error?.message });
    }

    const db = getDb();
    const userRef = db.collection('users').doc(authData.localId);
    const userDoc = await userRef.get();
    let user = userDoc.exists ? userDoc.data() : null;

    if (!user) {
      user = {
        uid: authData.localId,
        name: authData.displayName || authData.email.split('@')[0],
        email: authData.email,
        phone: '',
        pix: '',
        provider: 'password',
        createdAt: nowIso(),
        updatedAt: nowIso()
      };
      await userRef.set(user, { merge: true });
    }

    return res.status(200).json({
      idToken: authData.idToken,
      refreshToken: authData.refreshToken,
      expiresIn: authData.expiresIn,
      user
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
