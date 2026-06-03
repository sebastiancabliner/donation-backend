function buildCors() {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  return function corsMiddleware(req, res, next) {
    const origin = req.headers && req.headers.origin;

    if (origin && !allowed.includes(origin)) {
      return next(new Error(`Origin ${origin} not allowed by CORS`));
    }

    if (res && typeof res.setHeader === 'function') {
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end ? res.end() : next();
      }
    }

    return next();
  };
}

module.exports = buildCors;
