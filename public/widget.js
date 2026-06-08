/* donation-widget v1.0 — vanilla JS, Shadow DOM */
(function (global) {
  'use strict';

  // ── Detect backend URL from script tag ──────────────────────────────────────
  const BACKEND_URL = (() => {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src && s.src.includes('widget.js')) {
        return new URL(s.src).origin;
      }
    }
    return window.location.origin;
  })();

  // ── Amount presets ───────────────────────────────────────────────────────────
  const AMOUNTS = {
    ARS: [
      { value: 3000,  label: '$3.000',  tag: null },
      { value: 6000,  label: '$6.000',  tag: 'MÁS ELEGIDO' },
      { value: 9000,  label: '$9.000',  tag: null },
    ],
    USD: [
      { value: 2,  label: 'USD 2',  tag: null },
      { value: 5,  label: 'USD 5',  tag: 'MÁS ELEGIDO' },
      { value: 10, label: 'USD 10', tag: null },
    ],
  };

  // ── CSS (isolated in Shadow DOM) ─────────────────────────────────────────────
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=DM+Mono:wght@400;500&family=Inter:wght@400;500&display=swap');

    :host { all: initial; }

    .overlay {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      font-family: 'Inter', sans-serif;
    }

    .card {
      background: #1e2a3a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      overflow: hidden;
      width: 100%; max-width: 400px;
      position: relative;
      color: white;
    }

    .close-btn {
      position: absolute; top: 12px; right: 12px; z-index: 10;
      background: rgba(0,0,0,0.5); border: none; border-radius: 50%;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #9ca3af; font-size: 18px; line-height: 1;
    }
    .close-btn:hover { color: white; }

    .body { padding: 20px 18px 24px; }

    .title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 20px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.02em;
      color: white; margin: 0 0 6px;
    }

    .subtitle {
      font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 18px;
    }

    .currency-selector {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 8px; margin-bottom: 18px;
    }
    .currency-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 12px 8px;
      cursor: pointer; text-align: center;
      transition: all 0.15s; color: white;
    }
    .currency-btn:hover { border-color: rgba(29,78,216,0.5); }
    .currency-btn.active {
      border: 2px solid #1d4ed8;
      background: rgba(29,78,216,0.15);
    }
    .currency-btn .flag { font-size: 22px; display: block; margin-bottom: 4px; }
    .currency-btn .method-name {
      font-family: 'DM Mono', monospace; font-size: 10px;
      font-weight: 700; letter-spacing: 0.06em; color: #93c5fd;
    }
    .currency-btn .method-label {
      font-size: 11px; color: #94a3b8; margin-top: 2px;
    }

    .section-label {
      font-family: 'DM Mono', monospace; font-size: 10px;
      font-weight: 700; letter-spacing: 0.08em; color: white;
      margin-bottom: 10px;
    }
    .amounts {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 7px; margin-bottom: 10px;
    }
    .amount-btn {
      position: relative;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; padding: 10px 4px;
      cursor: pointer; text-align: center; color: white;
      transition: filter 0.15s;
    }
    .amount-btn:hover { filter: brightness(1.15); }
    .amount-btn.active {
      border: 2px solid #1d4ed8;
      background: rgba(29,78,216,0.2);
      padding: 14px 4px 10px;
    }
    .amount-btn .tag {
      position: absolute; top: -8px; left: 50%; transform: translateX(-50%);
      background: #7c3aed; border-radius: 5px;
      padding: 2px 6px;
      font-family: 'DM Mono', monospace; font-size: 7px;
      font-weight: 700; color: white; white-space: nowrap;
    }
    .amount-btn .price {
      font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 700;
    }
    .amount-btn .label {
      font-family: 'DM Mono', monospace; font-size: 7px;
      letter-spacing: 0.04em; color: #93c5fd; margin-top: 2px;
    }

    .custom-amount-row { margin-bottom: 14px; }
    .custom-amount-input {
      width: 100%; box-sizing: border-box;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 10px; padding: 10px 12px;
      color: white; font-family: 'DM Mono', monospace; font-size: 14px;
      outline: none;
    }
    .custom-amount-input:focus { border-color: #1d4ed8; }
    .custom-amount-input::placeholder { color: #4b5563; }

    .cta-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; background: #1d4ed8; border: none; border-radius: 12px;
      padding: 14px 16px; cursor: pointer; color: white;
      font-family: 'DM Mono', monospace; font-size: 12px;
      font-weight: 700; letter-spacing: 0.06em;
      transition: background 0.15s; margin-bottom: 8px;
    }
    .cta-btn:hover { background: #1e40af; }
    .cta-btn:disabled { background: #374151; cursor: not-allowed; }

    #paypal-btn-container { margin-bottom: 8px; min-height: 45px; }

    .skip-btn {
      display: block; width: 100%; background: none; border: none;
      color: #6b7280; font-size: 12px; cursor: pointer;
      font-family: 'Inter', sans-serif; text-decoration: underline;
      text-underline-offset: 3px; margin-top: 12px; text-align: center;
    }
    .skip-btn:hover { color: #9ca3af; }

    .success-screen { text-align: center; padding: 32px 20px; }
    .success-icon { font-size: 48px; margin-bottom: 12px; }
    .success-title {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 22px; font-weight: 800; text-transform: uppercase;
      color: white; margin: 0 0 8px;
    }
    .success-sub { font-size: 13px; color: #94a3b8; margin: 0 0 20px; }

    .error-msg {
      background: rgba(220,38,38,0.15);
      border: 1px solid rgba(220,38,38,0.3);
      border-radius: 8px; padding: 10px 12px;
      color: #fca5a5; font-size: 12px; margin-bottom: 12px;
      display: none;
    }
    .error-msg.visible { display: block; }

    .spinner {
      display: inline-block; width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hidden { display: none !important; }
  `;

  // ── HTML builder ─────────────────────────────────────────────────────────────
  function buildHTML(currency) {
    const amounts = AMOUNTS[currency];
    const isMp = currency === 'ARS';

    return `
      <div class="overlay" id="dw-overlay">
        <div class="card">
          <button class="close-btn" id="dw-close">×</button>
          <div class="body">
            <h2 class="title">LA GRIETA SIGUE<br>GRACIAS A VOS ❤️</h2>
            <p class="subtitle">Elegí cómo apoyar al proyecto:</p>

            <div class="currency-selector">
              <button class="currency-btn ${isMp ? 'active' : ''}" id="dw-ars-btn">
                <span class="flag">🇦🇷</span>
                <div class="method-name">MERCADO PAGO</div>
                <div class="method-label">Pesos argentinos</div>
              </button>
              <button class="currency-btn ${!isMp ? 'active' : ''}" id="dw-usd-btn">
                <span class="flag">🌎</span>
                <div class="method-name">PAYPAL</div>
                <div class="method-label">Dólares USD</div>
              </button>
            </div>

            <div class="section-label">ELEGÍ UN MONTO</div>

            <div class="amounts">
              ${amounts.map((a, i) => `
                <button class="amount-btn ${i === 1 ? 'active' : ''}" data-value="${a.value}">
                  ${a.tag ? `<span class="tag">${a.tag}</span>` : ''}
                  <div class="price">${a.label}</div>
                </button>
              `).join('')}
            </div>

            <div class="custom-amount-row">
              <input
                class="custom-amount-input"
                id="dw-custom-amount"
                type="number" min="1"
                placeholder="${isMp ? 'Otro monto en pesos...' : 'Otro monto en USD...'}"
              />
            </div>

            <div class="error-msg" id="dw-error"></div>

            <button class="cta-btn ${!isMp ? 'hidden' : ''}" id="dw-mp-btn">
              💙 DONAR CON MERCADO PAGO
            </button>

            <div id="paypal-btn-container" class="${isMp ? 'hidden' : ''}"></div>

            ${_state.showResults ? '<button class="skip-btn" id="dw-skip">Ver mis resultados →</button>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  function buildSuccessHTML() {
    return `
      <div class="overlay" id="dw-overlay">
        <div class="card">
          <div class="success-screen">
            <div class="success-icon">💙</div>
            <div class="success-title">¡MUCHAS GRACIAS!</div>
            <p class="success-sub">Tu donación ayuda a que La Grieta siga siendo gratuita para todos.</p>
            ${_state.showResults ? '<button class="cta-btn" id="dw-success-close">Ver mis resultados →</button>' : '<button class="cta-btn" id="dw-success-close">Cerrar →</button>'}
          </div>
        </div>
      </div>
    `;
  }

  // ── Internal state ────────────────────────────────────────────────────────────
  let _state = {
    site: 'lagrieta',
    currency: 'ARS',
    amount: 6000,
    showResults: true,
    host: null,
    shadow: null,
    publicConfig: null,
  };

  // ── DOM helpers ───────────────────────────────────────────────────────────────
  function $ (sel) { return _state.shadow ? _state.shadow.querySelector(sel) : null; }

  function showError(msg) {
    const el = $('#dw-error');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
  }

  function hideError() {
    const el = $('#dw-error');
    if (el) el.classList.remove('visible');
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
      ? '<span class="spinner"></span> PROCESANDO...'
      : '💙 DONAR CON MERCADO PAGO';
  }

  // ── Shared script loader ──────────────────────────────────────────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ── Backend config fetch ──────────────────────────────────────────────────────
  async function fetchPublicConfig(site) {
    const res = await fetch(`${BACKEND_URL}/api/v1/config/${site}`);
    if (!res.ok) throw new Error('No se pudo obtener la config del servidor');
    return res.json();
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  function render() {
    _state.shadow.innerHTML = `<style>${CSS}</style>${buildHTML(_state.currency)}`;
    bindEvents();
    if (_state.currency === 'USD' && _state.publicConfig) {
      initPayPal();
    }
  }

  function showSuccess() {
    _state.shadow.innerHTML = `<style>${CSS}</style>${buildSuccessHTML()}`;
    const closeBtn = _state.shadow.querySelector('#dw-success-close');
    if (closeBtn) closeBtn.addEventListener('click', () => DonationWidget.close());
    const overlay = _state.shadow.querySelector('#dw-overlay');
    if (overlay) overlay.addEventListener('click', (e) => {
      if (e.target.id === 'dw-overlay') DonationWidget.close();
    });
  }

  // ── Events ────────────────────────────────────────────────────────────────────
  function bindEvents() {
    $('#dw-close')?.addEventListener('click', () => DonationWidget.close());
    $('#dw-skip')?.addEventListener('click',  () => DonationWidget.close());
    $('#dw-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'dw-overlay') DonationWidget.close();
    });

    $('#dw-ars-btn')?.addEventListener('click', () => {
      _state.currency = 'ARS';
      _state.amount = 6000;
      render();
    });
    $('#dw-usd-btn')?.addEventListener('click', () => {
      _state.currency = 'USD';
      _state.amount = 5;
      render();
    });

    _state.shadow.querySelectorAll('.amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        _state.shadow.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        _state.amount = Number(btn.dataset.value);
        if ($('#dw-custom-amount')) $('#dw-custom-amount').value = '';
        hideError();
      });
    });

    $('#dw-custom-amount')?.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (val > 0) {
        _state.shadow.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
        _state.amount = val;
      }
      hideError();
    });

    $('#dw-mp-btn')?.addEventListener('click', () => handleMpPayment());
  }

  // ── MP payment ────────────────────────────────────────────────────────────────
  async function handleMpPayment() {
    if (!_state.amount || _state.amount <= 0) {
      showError('Por favor elegí o ingresá un monto válido.');
      return;
    }

    const mpBtn = $('#dw-mp-btn');
    setLoading(mpBtn, true);
    hideError();

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/donations/mercadopago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: _state.amount, site: _state.site }),
      });

      if (!res.ok) throw new Error('Error al crear preferencia');
      const { init_point } = await res.json();

      if (!init_point) throw new Error('No se recibió el link de pago');

      // Abrir MP en nueva pestaña y cerrar el widget.
      // No usamos autoOpen (inyecta overlay en el DOM del sitio y queda colgado al cerrar).
      window.open(init_point, '_blank');
      DonationWidget.close();

    } catch (err) {
      setLoading(mpBtn, false);
      showError('Hubo un error al conectar con Mercado Pago. Intentá de nuevo.');
      console.error('[widget/mp]', err);
    }
  }

  // ── PayPal ────────────────────────────────────────────────────────────────────
  async function initPayPal() {
    if (!_state.publicConfig?.paypal_client_id) {
      showError('No se pudo cargar PayPal. Intentá más tarde.');
      return;
    }

    const container = $('#paypal-btn-container');
    if (!container) return;

    // Show spinner immediately while SDK loads (can take 1-3 seconds)
    container.innerHTML = '<div style="text-align:center;padding:12px"><span class="spinner"></span><br><span style="font-family:\'DM Mono\',monospace;font-size:10px;color:#94a3b8;letter-spacing:0.06em">CARGANDO PAYPAL...</span></div>';

    const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${_state.publicConfig.paypal_client_id}&currency=USD`;

    try {
      await loadScript(sdkUrl);
    } catch {
      container.innerHTML = '';
      showError('No se pudo cargar el SDK de PayPal.');
      return;
    }

    // SDK ready — clear spinner and render buttons
    container.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'donate',
      },

      createOrder: async () => {
        hideError();
        const amount = _state.amount || 5;
        const res = await fetch(`${BACKEND_URL}/api/v1/donations/paypal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, site: _state.site }),
        });
        if (!res.ok) throw new Error('Error al crear orden PayPal');
        const { order_id } = await res.json();
        return order_id;
      },

      onApprove: async (data) => {
        const res = await fetch(
          `${BACKEND_URL}/api/v1/donations/paypal/capture/${data.orderID}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site: _state.site, amount: _state.amount }),
          }
        );
        if (!res.ok) {
          showError('Hubo un problema al confirmar el pago. Contactanos si el cargo se realizó.');
          return;
        }
        showSuccess();
      },

      onError: (err) => {
        showError('Hubo un problema con PayPal. Intentá de nuevo.');
        console.error('[widget/paypal]', err);
      },

      onCancel: () => { /* user cancelled — do nothing */ },

    }).render(container);
  }

  // ── Public API ────────────────────────────────────────────────────────────────
  const DonationWidget = {
    async open(config) {
      _state.site        = config.site || 'lagrieta';
      _state.currency    = 'ARS';
      _state.amount      = 6000;
      _state.showResults = config.showResults !== false;

      if (_state.host) _state.host.remove();
      _state.host = document.createElement('div');
      _state.host.id = 'donation-widget-host';
      document.body.appendChild(_state.host);
      _state.shadow = _state.host.attachShadow({ mode: 'open' });

      try {
        _state.publicConfig = await fetchPublicConfig(_state.site);
      } catch (err) {
        console.error('[widget] config error:', err.message);
      }

      render();
    },

    close() {
      if (_state.host) {
        _state.host.remove();
        _state.host   = null;
        _state.shadow = null;
      }
      cleanupMercadoPago();
    },
  };

  // El SDK de Mercado Pago (checkout autoOpen) inyecta su propio overlay/iframe
  // y a veces bloquea el scroll del body. Al cerrar nuestro widget eso quedaba
  // colgado y "nunca volvías al sitio". Esta limpieza barre esos restos.
  function cleanupMercadoPago() {
    try {
      const selectors = [
        'iframe[src*="mercadopago"]',
        'iframe[src*="mercadolibre"]',
        '[id^="mp-checkout"]',
        '[class*="mercadopago"]',
        '.mp-mercadopago-checkout',
        '#dw-mp-overlay',
      ];
      document.querySelectorAll(selectors.join(',')).forEach((el) => el.remove());
      // Restaurar scroll que MP suele bloquear
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    } catch (err) {
      console.error('[widget] cleanup error:', err.message);
    }
  }

  global.DonationWidget = DonationWidget;
})(window);
