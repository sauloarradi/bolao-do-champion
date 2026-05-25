import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { hasFourUniqueTeams, calculateScore, calculatePartialScore, BET_AMOUNT } from '../lib/scoring.js';
import { TEAM_IDS } from '../lib/teams.js';

function isAdmin(req) {
  return req.headers['x-admin-password'] &&
         req.headers['x-admin-password'] === process.env.ADMIN_PASSWORD;
}

function validateResult(result) {
  if (!hasFourUniqueTeams(result)) return 'Informe 4 seleções diferentes.';
  const invalid = result.find(teamId => !TEAM_IDS.includes(teamId));
  if (invalid) return `Seleção inválida: ${invalid}`;
  return null;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!isAdmin(req)) return res.status(401).json({ error: 'Senha admin inválida' });

  try {
    const { result, stage = 'final' } = req.body || {};
    const validationError = validateResult(result);
    if (validationError) return res.status(400).json({ error: validationError });

    const db = getDb();
    const snap = await db.collection('participantes').get();
    const batch = db.batch();

    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const { score, details } = stage === 'partial' ? calculatePartialScore(data.predictions || [], result) : calculateScore(data.predictions || [], result);
      batch.update(docSnap.ref, {
        score,
        scoreDetails: details,
        updatedAt: nowIso()
      });
    });

    const settingsRef = db.collection('settings').doc('finalResult');
    batch.set(settingsRef, {
      result,
      stage: stage === 'partial' ? 'partial' : 'final',
      calculatedAt: nowIso(),
      rules: {
        champion: 100,
        runnerUp: 70,
        third: 50,
        fourth: 30,
        top4WrongPosition: 15,
        betAmount: BET_AMOUNT
      }
    });

    await batch.commit();

    return res.status(200).json({ ok: true, result, stage: stage === 'partial' ? 'partial' : 'final' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
