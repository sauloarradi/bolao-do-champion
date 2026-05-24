import { getDb, nowIso } from '../lib/firebase.js';
import { handleOptions, setCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  try {
    const paymentId = req.body?.data?.id || req.query?.id;
    if (!paymentId) return res.status(200).json({ received: true });

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
      }
    });

    const payment = await mpResponse.json();
    if (!mpResponse.ok) {
      return res.status(200).json({ received: true, warning: 'Não foi possível consultar pagamento.' });
    }

    const betId = payment.external_reference;
    if (betId) {
      await getDb().collection('participantes').doc(betId).update({
        mercadoPagoPaymentId: String(payment.id),
        paymentStatus: payment.status,
        paid: payment.status === 'approved',
        paidAt: payment.status === 'approved' ? nowIso() : null,
        updatedAt: nowIso()
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
