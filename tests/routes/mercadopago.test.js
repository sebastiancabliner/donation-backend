const request = require('supertest');
const express = require('express');

jest.mock('../../src/config/sites', () => ({
  lagrieta: {
    name: 'La Grieta',
    mp_access_token: 'APP_USR-test-token',
    mp_public_key: 'APP_USR-test-pubkey',
  },
}));

jest.mock('../../src/services/mp.service', () => ({
  createPreference: jest.fn().mockResolvedValue({ preference_id: 'pref_test_abc123', init_point: 'https://mp.com/checkout?pref_id=pref_test_abc123' }),
}));

describe('POST /api/v1/donations/mercadopago', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    const mpRouter = require('../../src/routes/mercadopago');
    app.use('/api/v1/donations/mercadopago', mpRouter);
  });

  it('devuelve preference_id para una donación válida', async () => {
    const res = await request(app)
      .post('/api/v1/donations/mercadopago')
      .send({ amount: 6000, site: 'lagrieta' });
    expect(res.status).toBe(200);
    expect(res.body.preference_id).toBe('pref_test_abc123');
  });

  it('devuelve 400 si falta amount', async () => {
    const res = await request(app)
      .post('/api/v1/donations/mercadopago')
      .send({ site: 'lagrieta' });
    expect(res.status).toBe(400);
  });

  it('devuelve 404 si el site no existe', async () => {
    const res = await request(app)
      .post('/api/v1/donations/mercadopago')
      .send({ amount: 6000, site: 'sitio-raro' });
    expect(res.status).toBe(404);
  });
});
