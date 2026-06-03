jest.mock('resend', () => {
  const mockSend = jest.fn().mockResolvedValue({ data: { id: 'email-id-123' }, error: null });
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: mockSend },
    })),
    __mockSend: mockSend,
  };
});

describe('notify service', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.RESEND_FROM    = 'donaciones@lagrieta.com.ar';
    process.env.NOTIFY_EMAIL   = 'test@example.com';
  });

  it('llama a Resend con los datos correctos', async () => {
    const { sendDonationNotification } = require('../../src/services/notify.service');
    const resendModule = require('resend');
    const mockSend = resendModule.__mockSend;

    await sendDonationNotification({
      siteName: 'La Grieta',
      method: 'Mercado Pago',
      amount: 6000,
      currency: 'ARS',
    });

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];
    expect(callArgs.to).toContain('test@example.com');
    expect(callArgs.subject).toContain('La Grieta');
    expect(callArgs.subject).toContain('6000');
    expect(callArgs.html).toContain('Mercado Pago');
  });

  it('no lanza si Resend falla — solo loguea el error', async () => {
    const resendModule = require('resend');
    resendModule.__mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: 'Resend error' },
    });
    const { sendDonationNotification } = require('../../src/services/notify.service');
    await expect(
      sendDonationNotification({ siteName: 'La Grieta', method: 'PayPal', amount: 5, currency: 'USD' })
    ).resolves.not.toThrow();
  });
});
