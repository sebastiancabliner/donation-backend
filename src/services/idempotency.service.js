const processed = new Map();
const ONE_HOUR = 60 * 60 * 1000;

function isAlreadyProcessed(paymentId) {
  const now = Date.now();
  for (const [id, ts] of processed) {
    if (now - ts > ONE_HOUR) processed.delete(id);
  }
  if (processed.has(paymentId)) return true;
  processed.set(paymentId, now);
  return false;
}

module.exports = { isAlreadyProcessed };
