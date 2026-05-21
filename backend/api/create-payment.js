import { getDb, nowIso, todayIsAfterDeadline } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';
import { TEAMS } from '../lib/teams.js';

function cleanText(value, max = 160) {
  return String(value || '').trim().slice(0, max);
}

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    if (todayIsAfterDeadline()) {
      return res.status(400).json({ error: 'As apostas foram encerradas em 10/06/2026.' });
    }

    const name = cleanText(req.body?.name, 120);
    const pix = cleanText(req.body?.pix, 180);
    const teamId = cleanText(req.body?.teamId, 20);

    if (!name || !pix || !teamId) return res.status(400).json({ error: 'Preencha nome, chave Pix e seleção.' });
    if (!TEAMS.has(teamId)) return res.status(400).json({ error: 'Seleção inválida.' });

    const db = getDb();

    const dupSnap = await db.collection('participantes')
      .where('nameLower', '==', name.toLowerCase())
      .where('pix', '==', pix)
      .limit(1)
      .get();

    if (!dupSnap.empty) return res.status(409).json({ error: 'Você já possui uma aposta cadastrada com estes dados.' });

    const betRef = db.collection('participantes').doc();
    const createdAt = nowIso();

    await betRef.set({
      name,
      nameLower: name.toLowerCase(),
      pix,
      teamId,
      amount: 10,
      paid: false,
      paymentStatus: 'creating',
      mercadoPagoPaymentId: null,
      createdAt,
      updatedAt: createdAt,
      date: new Date().toLocaleDateString('pt-BR')
    });

    const paymentBody = {
      transaction_amount: 10,
      description: 'Bolão do Champion - Copa do Mundo 2026',
      payment_method_id: 'pix',
      external_reference: betRef.id,
      notification_url: `${process.env.API_BASE_URL}/api/webhook-mercadopago`,
      payer: {
        email: process.env.DEFAULT_PAYER_EMAIL || 'comprador@bolaochampion.com.br',
        first_name: name.split(' ')[0] || name
      }
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
      await betRef.update({ paymentStatus: 'mp_error', mercadoPagoError: payment, updatedAt: nowIso() });
      return res.status(400).json({ error: 'Mercado Pago recusou a criação do Pix.', details: payment });
    }

    const txData = payment?.point_of_interaction?.transaction_data || {};

    await betRef.update({
      mercadoPagoPaymentId: String(payment.id),
      paymentStatus: payment.status || 'pending',
      updatedAt: nowIso()
    });

    return res.status(200).json({
      betId: betRef.id,
      paymentId: payment.id,
      status: payment.status,
      qr_code: txData.qr_code,
      qr_code_base64: txData.qr_code_base64,
      ticket_url: txData.ticket_url
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
