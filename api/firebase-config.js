import { handleOptions, setCors } from '../lib/cors.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCors(req, res);

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_WEB_API_KEY;

  if (!projectId || !apiKey) {
    return res.status(500).json({ error: 'Firebase Web Config não configurado na Vercel.' });
  }

  return res.status(200).json({
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId
  });
}
