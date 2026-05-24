import { getAdminApp, getDb } from './firebase.js';

export function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  if (!header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

export async function requireUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error('Login obrigatório.');
    err.statusCode = 401;
    throw err;
  }
  getAdminApp();
  const admin = (await import('firebase-admin')).default;
  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    const err = new Error('Sessão inválida ou expirada. Faça login novamente.');
    err.statusCode = 401;
    throw err;
  }
}

export async function getUserProfile(uid) {
  const db = getDb();
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? doc.data() : null;
}
