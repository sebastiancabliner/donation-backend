const request = require('supertest');
const express = require('express');

jest.mock('axios');
const axios = require('axios');

const mockIsAlreadyProcessed = jest.fn().mockReturnValue(false);
jest.mock('../../src/services/idempotency.service', () => ({
  isAlreadyProcessed: mockIsAlreadyProcessed,
}));

const mockNotify = jest.fn().mockResolvedValue(undefined);
jest.mock('../../src/services/notify.service', () => ({
  sendDonationNotification: mockNotify,
}));

jest.mock('../../src/config/sites', () => ({
  lagrieta: {
    name: 'La Grieta',
    mp_access_token: 'APP_USR-test-token',
  },
}));

describe('Webhooks', () => {
  let app;
  beforeEach(() => {
    jest.resetModules();
    mockIsAlreadyProcessed.mockReturnValue(false);
    mockNotify.mockClear();
    axios.get.mockResolvedValue({ data: { transaction_amount: 6000 } });

    app = express();
    app.use(express.json());
    const webhooksRouter = require('../../src/routes/webhooks');
    app.use('/webhooks', webhooksRouter);
  });

  describe('POST /webhooks/mp/:site', () => {
    it('consulta el monto real a MP y envía notificación', async () => {
      const res = await request(app)
        .post('/webhooks/mp/lagrieta')
        .send({ type: 'payment', data: { id: 'pay_001' } });

      expect(res.status).toBe(200);

      await new Promise(r => setTimeout(r, 50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.mercadopago.com/v1/payments/pay_001',
        expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer APP_USR-test-token' }) })
      );
      expect(mockNotify).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'Mercado Pago', amount: 6000, currency: 'ARS' })
      );
    });

    it('ignora pagos ya procesados (idempotencia)', async () => {
      mockIsAlreadyProcessed.mockReturnValueOnce(true);

      const res = await request(app)
        .post('/webhooks/mp/lagrieta')
        .send({ type: 'payment', data: { id: 'pay_dup' } });

      expect(res.status).toBe(200);
      await new Promise(r => setTimeout(r, 50));
      expect(mockNotify).not.toHaveBeenCalled();
    });

    it('devuelve 404 para site desconocido', async () => {
      const res = await request(app)
        .post('/webhooks/mp/sitio-raro')
        .send({ type: 'payment', data: { id: 'pay_002' } });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /webhooks/pp', () => {
    it('responde 200 (PayPal webhooks son manejados en capture)', async () => {
      const res = await request(app).post('/webhooks/pp').send({});
      expect(res.status).toBe(200);
    });
  });
});
