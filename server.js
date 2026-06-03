require('dotenv').config();

const express = require('express');
const path = require('path');
const buildCors = require('./src/middleware/cors');

const configRouter      = require('./src/routes/config');
const mercadopagoRouter = require('./src/routes/mercadopago');
const paypalRouter      = require('./src/routes/paypal');
const webhooksRouter    = require('./src/routes/webhooks');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(buildCors());
app.use(express.json());

// ── Static files (widget.js) ──────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/config',                configRouter);
app.use('/api/v1/donations/mercadopago', mercadopagoRouter);
app.use('/api/v1/donations/paypal',      paypalRouter);
app.use('/webhooks',                     webhooksRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[donation-backend] running at http://localhost:${PORT}`);
});

module.exports = app;
