#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

console.log('[Test] Razorpay Credentials Check');
console.log('=====================================');
console.log(`Key ID: ${keyId ? keyId.substring(0, 20) + '...' : 'NOT SET'}`);
console.log(`Key Secret: ${keySecret ? '***' + keySecret.substring(keySecret.length - 4) : 'NOT SET'}`);
console.log(`Is Live Mode: ${keyId && keyId.startsWith('rzp_live_') ? 'YES' : 'NO'}`);
console.log('');

if (!keyId || !keySecret) {
  console.error('ERROR: Missing Razorpay credentials');
  process.exit(1);
}

// Create Basic Auth header
const auth = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
console.log(`Auth Header (first 30 chars): ${auth.substring(0, 30)}...`);
console.log('');

// Test order creation
console.log('[Test] Creating a test order...');
console.log('=====================================');

const orderData = {
  amount: 100, // 1 INR in paise
  currency: 'INR',
  receipt: `test-${Date.now()}`,
  notes: {
    test: 'true',
    timestamp: new Date().toISOString(),
  },
};

console.log('Order payload:', JSON.stringify(orderData, null, 2));
console.log('');

fetch('https://api.razorpay.com/v1/orders', {
  method: 'POST',
  headers: {
    Authorization: auth,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderData),
})
  .then((res) => {
    console.log(`[Response] Status: ${res.status} ${res.statusText}`);
    return res.json().then((data) => ({ status: res.status, data }));
  })
  .then(({ status, data }) => {
    if (status === 200 || status === 201) {
      console.log('✅ SUCCESS: Order created');
      console.log('Order ID:', data.id);
      console.log('Amount:', data.amount, 'paise');
      console.log('Currency:', data.currency);
      console.log('Status:', data.status);
      console.log('');
      console.log('Full response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ ERROR: Failed to create order');
      console.error('Response:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('❌ NETWORK ERROR:', err.message);
    process.exit(1);
  });
