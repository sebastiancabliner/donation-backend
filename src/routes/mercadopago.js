const express = require('express');
const sites = require('../config/sites');
const { createPreference } = require('../services/mp.service');

const router = express.Router();

router.post('/', async (req, res) => {
  const { amount, site } = req.body;

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount inválido' });
  }

  const siteConfig = sites[site];
  if (!siteConfig) return res.status(404).json({ error: 'Site no encontrado' });

  try {
    const { preference_id, init_point } = await createPreference({
      amount: Number(amount),
      siteName: siteConfig.name,
      accessToken: siteConfig.mp_access_token,
    });
    return res.json({ preference_id, init_point });
  } catch (err) {
    console.error('[mp route] Error:', err.message);
    return res.status(500).json({ error: 'Error al crear preferencia de pago' });
  }
});

module.exports = router;
