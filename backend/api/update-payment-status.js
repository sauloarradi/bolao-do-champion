import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

function isAdmin(req) {
  return req.headers['x-admin-password'] &&
         req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Senha admin inválida' });

  try {
    const { id, paid } = req.body || {};
    if (!id || typeof paid !== 'boolean') {
      return res.status(400).json({ error: 'Informe id e paid.' });
    }

    const db = getDb();
    await db.collection('participantes').doc(id).update({
      paid,
      paymentStatus: paid ? 'approved_manual' : 'pending',
      paidAt: paid ? nowIso() : null,
      updatedAt: nowIso()
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
