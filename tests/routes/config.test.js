const request = require('supertest');
const express = require('express');

jest.mock('../../src/config/sites', () => ({
  lagrieta: {
    name: 'La Grieta',
    mp_public_key: 'APP_USR-pubkey-lg',
    paypal_client_id: 'pp-client-lg',
    mp_access_token: 'secret',
    paypal_secret: 'secret',
  },
}));

describe('GET /api/v1/config/:site', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    app = express();
    const configRouter = require('../../src/routes/config');
    app.use('/api/v1/config', configRouter);
  });

  it('devuelve solo las claves públicas para un site válido', async () => {
    const res = await request(app).get('/api/v1/config/lagrieta');
    expect(res.status).toBe(200);
    expect(res.body.mp_public_key).toBe('APP_USR-pubkey-lg');
    expect(res.body.paypal_client_id).toBe('pp-client-lg');
    expect(res.body.mp_access_token).toBeUndefined();
    expect(res.body.paypal_secret).toBeUndefined();
  });

  it('devuelve 404 para un site desconocido', async () => {
    const res = await request(app).get('/api/v1/config/sitio-raro');
    expect(res.status).toBe(404);
  });
});
