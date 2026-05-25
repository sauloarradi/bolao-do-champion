export function setCors(req, res) {
  const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
  const origin = req.headers.origin;

  if (allowedOrigin === '*' || allowedOrigin === origin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin === '*' ? '*' : origin);
  }

  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Password, Authorization');
}

export function handleOptions(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
