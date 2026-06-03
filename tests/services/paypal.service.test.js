jest.mock('axios');
const axios = require('axios');

describe('paypal service', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.PAYPAL_MODE = 'sandbox';
  });

  it('createOrder devuelve order_id', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { access_token: 'BEARER_TOKEN' } })
      .mockResolvedValueOnce({ data: { id: 'ORDER_123_ABC' } });

    const { createOrder } = require('../../src/services/paypal.service');
    const orderId = await createOrder({
      amount: 5,
      siteName: 'La Grieta',
      clientId: 'pp-client-id',
      secret: 'pp-secret',
    });

    expect(orderId).toBe('ORDER_123_ABC');
  });

  it('captureOrder devuelve status COMPLETED', async () => {
    axios.post
      .mockResolvedValueOnce({ data: { access_token: 'BEARER_TOKEN' } })
      .mockResolvedValueOnce({
        data: {
          status: 'COMPLETED',
          purchase_units: [{ payments: { captures: [{ amount: { value: '5.00' } }] } }]
        }
      });

    const { captureOrder } = require('../../src/services/paypal.service');
    const result = await captureOrder({
      orderId: 'ORDER_123_ABC',
      clientId: 'pp-client-id',
      secret: 'pp-secret',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.amount).toBe('5.00');
  });
});
