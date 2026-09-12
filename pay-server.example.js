const crypto = require('crypto');
function ecpayCheckMac(params, hashKey, hashIV) {
  const keys = Object.keys(params).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  let raw = 'HashKey=' + hashKey;
  keys.forEach((k) => { raw += '&' + k + '=' + params[k]; });
  raw += '&HashIV=' + hashIV;
  const encoded = encodeURIComponent(raw).toLowerCase()
    .replace(/%20/g, '+').replace(/%2d/g, '-').replace(/%5f/g, '_')
    .replace(/%2e/g, '.').replace(/%21/g, '!').replace(/%2a/g, '*')
    .replace(/%28/g, '(').replace(/%29/g, ')');
  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase();
}
function tradeNo() {
  const t = new Date(); const p = (n) => String(n).padStart(2, '0');
  return 'SUV' + t.getFullYear() + p(t.getMonth()+1) + p(t.getDate()) + p(t.getHours()) + p(t.getMinutes()) + p(t.getSeconds());
}
async function createCheckout(req, res) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const fields = {
    MerchantID: process.env.ECPAY_MERCHANT_ID,
    MerchantTradeNo: tradeNo(),
    MerchantTradeDate: new Date().toLocaleString('sv-SE', { hour12: false }).replace('T', ' ').slice(0, 19),
    PaymentType: 'aio',
    TotalAmount: String(body.amount || 299),
    TradeDesc: 'suv-tco',
    ItemName: String(body.item || 'SUV report').slice(0, 40),
    ReturnURL: process.env.ECPAY_RETURN_URL || body.returnUrl,
    OrderResultURL: body.returnUrl,
    ClientBackURL: body.returnUrl,
    ChoosePayment: 'ALL',
    EncryptType: '1'
  };
  fields.CheckMacValue = ecpayCheckMac(fields, process.env.ECPAY_HASH_KEY, process.env.ECPAY_HASH_IV);
  res.json({ action: process.env.ECPAY_ACTION || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', fields });
}
module.exports = { createCheckout, ecpayCheckMac };
