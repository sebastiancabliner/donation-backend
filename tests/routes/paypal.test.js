const request = require('supertest');
const express = require('express');

jest.mock('../../src/config/sites', () => ({
  lagrieta: {
    name: 'La Grieta',
    paypal_client_id: 'pp-client-test',
    paypal_secret: 'pp-secret-test',
  },
}));

const mockCreateOrder  = jest.fn().mockResolvedValue('ORDER_TEST_123');
const mockCaptureOrder = jest.fn().mockResolvedValue({ status: 'COMPLETED', amount: '5.00' });

jest.mock('../../src/services/paypal.service', () => ({
  createOrder: mockCreateOrder,
  captureOrder: mockCaptureOrder,
}));

jest.mock('../../src/services/notify.service', () => ({
  sendDonationNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('PayPal routes', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    app = express();
    app.use(express.json());
    const paypalRouter = require('../../src/routes/paypal');
    app.use('/api/v1/donations/paypal', paypalRouter);
  });

  describe('POST /api/v1/donations/paypal', () => {
    it('crea una orden y devuelve order_id', async () => {
      const res = await request(app)
        .post('/api/v1/donations/paypal')
        .send({ amount: 5, site: 'lagrieta' });
      expect(res.status).toBe(200);
      expect(res.body.order_id).toBe('ORDER_TEST_123');
    });

    it('devuelve 400 si falta amount', async () => {
      const res = await request(app)
        .post('/api/v1/donations/paypal')
        .send({ site: 'lagrieta' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/donations/paypal/capture/:orderId', () => {
    it('captura la orden y devuelve status COMPLETED', async () => {
      const res = await request(app)
        .post('/api/v1/donations/paypal/capture/ORDER_TEST_123')
        .send({ site: 'lagrieta' });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('COMPLETED');
    });

    it('devuelve 404 para site desconocido', async () => {
      const res = await request(app)
        .post('/api/v1/donations/paypal/capture/ORDER_TEST_123')
        .send({ site: 'sitio-raro' });
      expect(res.status).toBe(404);
    });
  });
});
