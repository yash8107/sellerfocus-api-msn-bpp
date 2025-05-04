// utils/hash.js
const blake = require('blakejs');

function hashMessage(payload) {
  const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const hash = blake.blake2b(payloadStr, null, 64);
  return Buffer.from(hash).toString('base64');
}

module.exports = { hashMessage };
