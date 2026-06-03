const express = require('express');
const sites = require('../config/sites');
const { createOrder, captureOrder } = require('../services/paypal.service');
const { sendDonationNotification } = require('../services/notify.service');

const router = express.Router();

router.post('/', async (req, res) => {
  const { amount, site } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount inválido' });
  }

  const siteConfig = sites[site];
  if (!siteConfig) return res.status(404).json({ error: 'Site no encontrado' });

  try {
    const orderId = await createOrder({
      amount: Number(amount),
      siteName: siteConfig.name,
      clientId: siteConfig.paypal_client_id,
      secret: siteConfig.paypal_secret,
    });
    return res.json({ order_id: orderId });
  } catch (err) {
    console.error('[paypal route] createOrder error:', err.message);
    return res.status(500).json({ error: 'Error al crear orden PayPal' });
  }
});

router.post('/capture/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { site, amount } = req.body;

  const siteConfig = sites[site];
  if (!siteConfig) return res.status(404).json({ error: 'Site no encontrado' });

  try {
    const result = await captureOrder({
      orderId,
      clientId: siteConfig.paypal_client_id,
      secret: siteConfig.paypal_secret,
    });

    if (result.status === 'COMPLETED') {
      sendDonationNotification({
        siteName: siteConfig.name,
        method: 'PayPal',
        amount: result.amount,
        currency: 'USD',
      }).catch(err => console.error('[paypal capture] notify error:', err.message));
    }

    return res.json({ status: result.status });
  } catch (err) {
    console.error('[paypal route] capture error:', err.message);
    return res.status(500).json({ error: 'Error al capturar pago PayPal' });
  }
});

module.exports = router;
