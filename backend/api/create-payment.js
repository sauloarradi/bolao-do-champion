import { getDb, nowIso, todayIsAfterDeadline } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { BET_AMOUNT, hasFourUniqueTeams } from '../lib/scoring.js';
import { TEAM_IDS } from '../lib/teams.js';

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
      return res.status(400).json({ error: 'O prazo para apostas terminou em 10/06/2026.' });
    }

    const body = req.body || {};
    const name = String(body.name || '').trim();
    const pix = String(body.pix || '').trim();
    const predictions = Array.isArray(body.predictions) ? body.predictions.map(String) : [];

    const validationError = validateInput({ name, pix, predictions });
    if (validationError) return res.status(400).json({ error: validationError });

    const db = getDb();

    const duplicateSnap = await db.collection('participantes')
      .where('nameLower', '==', name.toLowerCase())
      .where('pix', '==', pix)
      .limit(1)
      .get();

    if (!duplicateSnap.empty) {
      return res.status(409).json({ error: 'Já existe uma aposta com esse nome e essa chave Pix.' });
    }

    const betRef = await db.collection('participantes').add({
      name,
      nameLower: name.toLowerCase(),
      pix,
      predictions,
      paid: false,
      paymentStatus: 'pending',
      amount: BET_AMOUNT,
      score: 0,
      scoreDetails: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
      date: new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    });

    const paymentBody = {
      transaction_amount: BET_AMOUNT,
      description: 'Bolão do Champion - Top 4 Copa 2026',
      payment_method_id: 'pix',
      payer: {
        email: process.env.DEFAULT_PAYER_EMAIL || 'comprador@email.com',
        first_name: name.split(' ')[0]
      },
      external_reference: betRef.id,
      notification_url: `${process.env.API_BASE_URL}/api/webhook-mercadopago`
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': betRef.id
      },
      body: JSON.stringify(paymentBody)
    });

    const payment = await mpResponse.json();

    if (!mpResponse.ok) {
      await betRef.delete();
      return res.status(400).json({ error: 'Erro ao gerar Pix no Mercado Pago.', details: payment });
    }

    const qr = payment.point_of_interaction?.transaction_data || {};

    await betRef.update({
      mercadoPagoPaymentId: String(payment.id),
      paymentStatus: payment.status || 'pending',
      updatedAt: nowIso()
    });

    return res.status(200).json({
      betId: betRef.id,
      paymentId: payment.id,
      status: payment.status,
      amount: BET_AMOUNT,
      qr_code: qr.qr_code,
      qr_code_base64: qr.qr_code_base64,
      ticket_url: qr.ticket_url
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
