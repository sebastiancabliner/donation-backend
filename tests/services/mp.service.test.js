jest.mock('mercadopago', () => {
  const mockCreate = jest.fn().mockResolvedValue({ id: 'pref_test_abc123', init_point: 'https://mp.com/checkout?pref_id=pref_test_abc123' });
  return {
    MercadoPagoConfig: jest.fn(),
    Preference: jest.fn().mockImplementation(() => ({ create: mockCreate })),
    __mockCreate: mockCreate,
  };
});

describe('mp service', () => {
  beforeEach(() => jest.resetModules());

  it('crea una preferencia y devuelve preference_id + init_point', async () => {
    const { createPreference } = require('../../src/services/mp.service');
    const result = await createPreference({
      amount: 6000,
      siteName: 'La Grieta',
      accessToken: 'APP_USR-test-token',
    });
    expect(result.preference_id).toBe('pref_test_abc123');
    expect(result.init_point).toContain('pref_test_abc123');
  });

  it('lanza error si el SDK falla', async () => {
    const mpModule = require('mercadopago');
    mpModule.__mockCreate.mockRejectedValueOnce(new Error('MP API error'));
    const { createPreference } = require('../../src/services/mp.service');
    await expect(
      createPreference({ amount: 6000, siteName: 'La Grieta', accessToken: 'token' })
    ).rejects.toThrow('MP API error');
  });
});
