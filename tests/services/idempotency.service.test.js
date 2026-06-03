describe('idempotency service', () => {
  let idempotency;

  beforeEach(() => {
    jest.resetModules();
    idempotency = require('../../src/services/idempotency.service');
  });

  it('devuelve false para un payment_id nuevo', () => {
    expect(idempotency.isAlreadyProcessed('pay_001')).toBe(false);
  });

  it('devuelve true si el mismo payment_id se consulta dos veces', () => {
    idempotency.isAlreadyProcessed('pay_002');
    expect(idempotency.isAlreadyProcessed('pay_002')).toBe(true);
  });

  it('IDs distintos son independientes', () => {
    idempotency.isAlreadyProcessed('pay_003');
    expect(idempotency.isAlreadyProcessed('pay_004')).toBe(false);
  });
});
