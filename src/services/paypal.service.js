const axios = require('axios');

function getBaseUrl() {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function getAccessToken({ clientId, secret }) {
  const base = getBaseUrl();
  const res = await axios.post(
    `${base}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      auth: { username: clientId, password: secret },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );
  return res.data.access_token;
}

async function createOrder({ amount, siteName, clientId, secret }) {
  const base = getBaseUrl();
  const token = await getAccessToken({ clientId, secret });

  const res = await axios.post(
    `${base}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: Number(amount).toFixed(2) },
        description: `Donación a ${siteName}`,
      }],
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return res.data.id;
}

async function captureOrder({ orderId, clientId, secret }) {
  const base = getBaseUrl();
  const token = await getAccessToken({ clientId, secret });

  const res = await axios.post(
    `${base}/v2/checkout/orders/${orderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  const capture = res.data.purchase_units?.[0]?.payments?.captures?.[0];
  return {
    status: res.data.status,
    amount: capture?.amount?.value,
  };
}

module.exports = { createOrder, captureOrder };
