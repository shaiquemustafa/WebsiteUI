import { getToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://wesbitebe.onrender.com';

export function getBillingUrl() {
  const base = import.meta.env.VITE_APP_BASE_URL || window.location.origin;
  return `${base.replace(/\/$/, '')}/#billing`;
}

/** @deprecated Use getBillingUrl */
export function getSubscribeUrl() {
  return getBillingUrl();
}

export async function fetchPaymentConfig() {
  const res = await fetch(`${API_BASE}/api/payment/config`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Payment is unavailable right now.');
  }
  return res.json();
}

export async function fetchSubscription() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE}/api/subscription/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  return res.json();
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function startSubscriptionPayment({ user, onSuccess, onError, onConfirming }) {
  const token = getToken();
  if (!token) {
    onError?.('Please log in to continue.');
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onError?.('Could not load payment gateway. Please try again.');
    return;
  }

  let config;
  try {
    config = await fetchPaymentConfig();
  } catch (err) {
    onError?.(err.message);
    return;
  }

  let order;
  try {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to start payment.');
    order = data;
  } catch (err) {
    onError?.(err.message || 'Failed to start payment.');
    return;
  }

  const displayPhone = user?.phone ? String(user.phone).replace(/^91/, '') : '';

  let settled = false;

  const cleanup = () => {
    document.removeEventListener('visibilitychange', onVisible);
  };

  const finishSuccess = (subscription) => {
    if (settled) return;
    settled = true;
    cleanup();
    onSuccess?.(subscription);
  };

  const finishError = (msg) => {
    if (settled) return;
    settled = true;
    cleanup();
    onError?.(msg);
  };

  const tryPollPaid = async () => {
    const sub = await fetchSubscription();
    if (sub?.is_paid) {
      finishSuccess(sub);
      return true;
    }
    return false;
  };

  const onVisible = () => {
    if (document.visibilityState === 'visible' && !settled) {
      tryPollPaid();
    }
  };

  document.addEventListener('visibilitychange', onVisible);

  const options = {
    key: order.key_id || config.key_id,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'RITO',
    description: `Monthly access — ₹${config.amount_inr}`,
    order_id: order.order_id,
    prefill: {
      name: user?.name || '',
      contact: displayPhone,
    },
    theme: { color: '#2563eb' },
    handler: async (response) => {
      try {
        const res = await fetch(`${API_BASE}/api/payment/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (await tryPollPaid()) return;
          throw new Error(data.detail || 'Payment verification failed.');
        }
        finishSuccess(data.subscription);
      } catch (err) {
        if (await tryPollPaid()) return;
        finishError(err.message || 'Payment verification failed.');
      }
    },
    modal: {
      ondismiss: async () => {
        if (settled) return;
        if (await tryPollPaid()) return;
        finishError('Payment cancelled.');
      },
    },
  };

  onConfirming?.();
  const rzp = new window.Razorpay(options);
  rzp.open();
}
