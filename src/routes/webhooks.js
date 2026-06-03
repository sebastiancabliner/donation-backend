const express = require('express');
const axios = require('axios');
const { isAlreadyProcessed } = require('../services/idempotency.service');
const { sendDonationNotification } = require('../services/notify.service');
const sites = require('../config/sites');

const router = express.Router();

// POST /webhooks/mp/:site
// Register in MP dashboard as: https://your-backend.railway.app/webhooks/mp/lagrieta
// MP only sends data.id in the body — we fetch the real amount from their API
router.post('/mp/:site', async (req, res) => {
  const siteConfig = sites[req.params.site];
  if (!siteConfig) return res.status(404).json({ error: 'Site no encontrado' });

  // Respond 200 immediately so MP doesn't retry
  res.status(200).json({ ok: true });

  const { type, data } = req.body;
  if (type !== 'payment' || !data?.id) return;

  const paymentId = String(data.id);
  if (isAlreadyProcessed(paymentId)) return;

  let realAmount = '(desconocido)';
  try {
    const mpRes = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${siteConfig.mp_access_token}` } }
    );
    realAmount = mpRes.data.transaction_amount;
  } catch (err) {
    console.error('[webhook/mp] fetch payment error:', err.message);
  }

  sendDonationNotification({
    siteName: siteConfig.name,
    method: 'Mercado Pago',
    amount: realAmount,
    currency: 'ARS',
  }).catch(err => console.error('[webhook/mp] notify error:', err.message));
});

// POST /webhooks/pp
// PayPal webhooks are informational. Payment already captured in /capture.
router.post('/pp', (req, res) => {
  res.status(200).json({ ok: true });
});

module.exports = router;
