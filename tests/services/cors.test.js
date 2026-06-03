describe('cors middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.ALLOWED_ORIGINS = 'https://lagrieta.com.ar,https://evidencia.ar';
  });

  it('acepta origins permitidos', () => {
    const buildCors = require('../../src/middleware/cors');
    const middleware = buildCors();
    const allowed = [];
    middleware({ headers: { origin: 'https://lagrieta.com.ar' } }, {}, (err) => {
      allowed.push(err);
    });
    expect(allowed[0]).toBeUndefined();
  });

  it('rechaza origins no listados', () => {
    const buildCors = require('../../src/middleware/cors');
    const middleware = buildCors();
    const errors = [];
    middleware({ headers: { origin: 'https://sitio-malicioso.com' } }, {}, (err) => {
      errors.push(err);
    });
    expect(errors[0]).toBeInstanceOf(Error);
    expect(errors[0].message).toMatch(/not allowed/i);
  });
});
