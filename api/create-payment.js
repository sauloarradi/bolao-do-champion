import { getDb, nowIso, todayIsAfterDeadline } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { BET_AMOUNT, hasFourUniqueTeams } from '../lib/scoring.js';
import { TEAM_IDS } from '../lib/teams.js';
import { requireUser, getUserProfile } from '../lib/auth.js';

function validateInput({ name, pix, predictions }) {
  if (!name || String(name).trim().length < 3) return 'Informe seu nome completo.';
  if (!pix || String(pix).trim().length < 3) return 'Informe sua chave Pix para receber o prêmio.';
  if (!hasFourUniqueTeams(predictions)) return 'Escolha 4 seleções diferentes para o Top 4.';
  const invalid = predictions.find(teamId => !TEAM_IDS.includes(teamId));
  if (invalid) return `Seleção inválida: ${invalid}`;
  return null;
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    if (todayIsAfterDeadline()) {
      return res.status(400).json({ error: 'O prazo para apostas terminou em 15/06/2026.' });
    }

    const authUser = await requireUser(req);
    const profile = await getUserProfile(authUser.uid);

    const body = req.body || {};
    const name = String(body.name || profile?.name || authUser.name || authUser.email || '').trim();
    const pix = String(body.pix || profile?.pix || '').trim();
    const predictions = Array.isArray(body.predictions) ? body.predictions.map(String) : [];

    const validationError = validateInput({ name, pix, predictions });
    if (validationError) return res.status(400).json({ error: validationError });

    const db = getDb();
    const betRef = await db.collection('participantes').add({
      name,
      nameLower: name.toLowerCase(),
      pix,
      uid: authUser.uid,
      email: authUser.email || profile?.email || '',
      phone: profile?.phone || '',
      ownerProvider: profile?.provider || 'password',
      predictions,
      paid: false,
      paymentStatus: 'pending_manual',
      paymentMethod: 'manual_pix',
      manualPayment: true,
      amount: BET_AMOUNT,
      score: 0,
      scoreDetails: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      date: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    return res.status(200).json({
      ok: true,
      betId: betRef.id,
      status: 'pending_manual',
      paymentStatus: 'pending_manual',
      paymentMethod: 'manual_pix',
      amount: BET_AMOUNT,
      message: 'Aposta registrada. Aguarde a confirmação manual do pagamento pelo administrador.'
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}
