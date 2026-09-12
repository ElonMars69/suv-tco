const Stripe = require('stripe');
async function createCheckout(req, res) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const amount = Math.max(1, Number(body.amount || 299));
  const item = String(body.item || 'SUV report').slice(0, 80);
  const back = body.returnUrl || process.env.PUBLIC_SITE || 'https://example.com';
  const success = back.includes('?') ? back + '&paid=1' : back + '?paid=1';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: 'zh-TW',
    success_url: success,
    cancel_url: back,
    line_items: process.env.STRIPE_PRICE_ID
      ? [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }]
      : [{
          quantity: 1,
          price_data: {
            currency: 'twd',
            unit_amount: amount,
            product_data: { name: item }
          }
        }]
  });
  res.json({ url: session.url });
}
module.exports = { createCheckout };
