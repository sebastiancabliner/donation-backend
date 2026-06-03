describe('sites config', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.MP_ACCESS_TOKEN_LAGRIETA  = 'mp-token-lg';
    process.env.MP_PUBLIC_KEY_LAGRIETA    = 'mp-pubkey-lg';
    process.env.PAYPAL_CLIENT_ID_LAGRIETA = 'pp-client-lg';
    process.env.PAYPAL_SECRET_LAGRIETA    = 'pp-secret-lg';
    process.env.MP_ACCESS_TOKEN_EVIDENCIA  = 'mp-token-ev';
    process.env.MP_PUBLIC_KEY_EVIDENCIA    = 'mp-pubkey-ev';
    process.env.PAYPAL_CLIENT_ID_EVIDENCIA = 'pp-client-ev';
    process.env.PAYPAL_SECRET_EVIDENCIA    = 'pp-secret-ev';
  });

  it('exposes lagrieta config from env vars', () => {
    const sites = require('../../src/config/sites');
    expect(sites.lagrieta.name).toBe('La Grieta');
    expect(sites.lagrieta.mp_access_token).toBe('mp-token-lg');
    expect(sites.lagrieta.mp_public_key).toBe('mp-pubkey-lg');
    expect(sites.lagrieta.paypal_client_id).toBe('pp-client-lg');
    expect(sites.lagrieta.paypal_secret).toBe('pp-secret-lg');
  });

  it('exposes evidencia config from env vars', () => {
    const sites = require('../../src/config/sites');
    expect(sites.evidencia.name).toBe('EvidencIA');
    expect(sites.evidencia.mp_access_token).toBe('mp-token-ev');
  });

  it('returns undefined for unknown site', () => {
    const sites = require('../../src/config/sites');
    expect(sites['sitio-inexistente']).toBeUndefined();
  });
});
