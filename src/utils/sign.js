const sodium = require('libsodium-wrappers');

function signMessage(signingString, privateKey) {
  // Convert signing string to buffer
  const signingBuffer = Buffer.from(signingString);
  
  // Sign the message
  const signatureBytes = sodium.crypto_sign_detached(
    signingBuffer,
    sodium.from_base64(privateKey)
  );

  // Convert signature to base64
  return sodium.to_base64(signatureBytes);
}

module.exports = { signMessage };