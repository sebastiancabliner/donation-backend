const { MercadoPagoConfig, Preference } = require('mercadopago');

async function createPreference({ amount, siteName, accessToken }) {
  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  const response = await preference.create({
    body: {
      items: [{
        title: `Donación a ${siteName}`,
        quantity: 1,
        unit_price: Number(amount),
        currency_id: 'ARS',
      }],
      back_urls: {
        success: 'https://lagrieta.com.ar',
        failure: 'https://lagrieta.com.ar',
        pending: 'https://lagrieta.com.ar',
      },
      auto_return: 'approved',
    },
  });

  return { preference_id: response.id, init_point: response.init_point };
}

module.exports = { createPreference };
