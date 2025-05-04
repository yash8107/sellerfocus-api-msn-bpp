// Sign Message with Private Key
const nacl = require('tweetnacl');

function signMessage(signingString, privateKeyBase64) {
  const privateKey = Buffer.from(privateKeyBase64, 'base64');
  const signedMsg = nacl.sign.detached(Buffer.from(signingString), privateKey);
  console.log("Signed message:", Buffer.from(signedMsg).toString('base64'));
  return Buffer.from(signedMsg).toString('base64');
}

module.exports = { signMessage };