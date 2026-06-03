const express = require('express');
const sites = require('../config/sites');

const router = express.Router();

router.get('/:site', (req, res) => {
  const siteConfig = sites[req.params.site];
  if (!siteConfig) return res.status(404).json({ error: 'Site not found' });
  return res.json({
    mp_public_key: siteConfig.mp_public_key,
    paypal_client_id: siteConfig.paypal_client_id,
  });
});

module.exports = router;
