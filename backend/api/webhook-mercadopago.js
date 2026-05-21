import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  try {
    const body = req.body || {};
    const paymentId = body?.data?.id || body?.id || req.query?.id || req.query?.['data.id'];

    if (!paymentId) return res.status(200).json({ received: true, ignored: 'no-payment-id' });

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` }
    });

    const payment = await mpResponse.json();
    if (!mpResponse.ok) return res.status(200).json({ received: true, mp_error: payment });

    const betId = payment.external_reference;
    if (betId) {
      const status = payment.status || 'unknown';
      await getDb().collection('participantes').doc(betId).update({
        mercadoPagoPaymentId: String(payment.id),
        paymentStatus: status,
        paid: status === 'approved',
        paidAt: status === 'approved' ? nowIso() : null,
        updatedAt: nowIso(),
        lastWebhookAt: nowIso()
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(200).json({ received: true, error: error.message });
  }
}
