import { getDb, getAdminApp, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

function clean(v) { return String(v || '').trim(); }

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const idToken = clean(req.body?.idToken);
    if (!idToken) return res.status(400).json({ error: 'Token do Google/Firebase não informado.' });

    getAdminApp();
    const admin = (await import('firebase-admin')).default;
    const decoded = await admin.auth().verifyIdToken(idToken);

    const db = getDb();
    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();
    const old = userDoc.exists ? userDoc.data() : {};

    const profile = {
      uid: decoded.uid,
      name: old.name || decoded.name || decoded.email?.split('@')[0] || 'Usuário',
      email: decoded.email || old.email || '',
      phone: old.phone || '',
      pix: old.pix || '',
      photoURL: decoded.picture || old.photoURL || '',
      provider: old.provider === 'password' ? 'password+google' : 'google',
      createdAt: old.createdAt || nowIso(),
      updatedAt: nowIso()
    };

    await userRef.set(profile, { merge: true });

    return res.status(200).json({
      idToken,
      user: profile
    });
  } catch (error) {
    return res.status(401).json({ error: 'Não foi possível autenticar com Google.', details: error.message });
  }
}
