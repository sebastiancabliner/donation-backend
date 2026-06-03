const { Resend } = require('resend');

async function sendDonationNotification({ siteName, method, amount, currency }) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const amountFormatted = currency === 'ARS'
    ? `$${Number(amount).toLocaleString('es-AR')} ARS`
    : `USD ${amount}`;

  const subject = `💙 Nueva donación — ${siteName} — ${amount} ${currency} (${amountFormatted})`;

  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#1d4ed8">💙 Nueva donación recibida</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Sitio</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${siteName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Método</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${method}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Monto</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${amountFormatted}</td></tr>
        <tr><td style="padding:8px"><strong>Fecha</strong></td><td style="padding:8px">${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</td></tr>
      </table>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: [process.env.NOTIFY_EMAIL],
    subject,
    html,
  });

  if (error) {
    console.error('[notify] Resend error:', error.message);
  }
}

module.exports = { sendDonationNotification };
