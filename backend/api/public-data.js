import { getDb } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const db = getDb();
    const snap = await db.collection('participantes').orderBy('createdAt', 'asc').get();
    const participants = snap.docs.map(doc => {
      const p = doc.data();
      return {
        id: doc.id,
        name: p.name,
        teamId: p.teamId,
        paid: Boolean(p.paid),
        paymentStatus: p.paymentStatus || 'pending',
        date: p.date || ''
      };
    });
    return res.status(200).json({ participants });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
