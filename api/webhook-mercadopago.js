import { handleOptions, setCors } from '../lib/cors.js';

// Pagamento Mercado Pago removido do fluxo em produção.
// Mantemos este endpoint apenas para não quebrar notificações antigas já configuradas no Mercado Pago.
// Ele NÃO altera mais o status das apostas, evitando que confirmações manuais voltem para pendente.
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);
  return res.status(200).json({ received: true, ignored: true, reason: 'manual_pix_flow_enabled' });
}
