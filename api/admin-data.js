import { getDb } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { BET_AMOUNT } from '../lib/scoring.js';

function isAdmin(req) {
  return req.headers['x-admin-password'] &&
         req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Senha admin inválida' });

  try {
    const db = getDb();
    const snap = await db.collection('participantes').orderBy('createdAt', 'asc').get();
    const participants = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const finalDoc = await db.collection('settings').doc('finalResult').get();
    const finalResult = finalDoc.exists ? finalDoc.data() : null;

    return res.status(200).json({
      betAmount: BET_AMOUNT,
      participants,
      finalResult: finalResult?.result || null,
      finalStage: finalResult?.stage || null,
      finalCalculatedAt: finalResult?.calculatedAt || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
