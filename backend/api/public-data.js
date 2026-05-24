import { getDb } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { BET_AMOUNT } from '../lib/scoring.js';

function publicParticipant(doc) {
  const d = doc.data();
  return {
    id: doc.id,
    name: d.name,
    predictions: Array.isArray(d.predictions) ? d.predictions : (d.teamId ? [d.teamId] : []),
    paid: !!d.paid,
    paymentStatus: d.paymentStatus || 'pending',
    score: Number(d.score || 0),
    scoreDetails: Array.isArray(d.scoreDetails) ? d.scoreDetails : [],
    date: d.date || ''
  };
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const db = getDb();
    const snap = await db.collection('participantes').orderBy('createdAt', 'asc').get();
    const participants = snap.docs.map(publicParticipant);

    const finalDoc = await db.collection('settings').doc('finalResult').get();
    const finalResult = finalDoc.exists ? finalDoc.data() : null;

    return res.status(200).json({
      betAmount: BET_AMOUNT,
      participants,
      finalResult: finalResult?.result || null,
      finalCalculatedAt: finalResult?.calculatedAt || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
