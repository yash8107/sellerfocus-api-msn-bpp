const sodium = require('libsodium-wrappers');
const crypto = require('crypto');

class AuthHeaderGenerator {
  /**
   * Generate an ONDC-compliant authorization header
   * @param {Object} payload - The request payload
   * @returns {Object} Authorization header components
   */
  async generateAuthorizationHeader(req, res) {
    try {
      // Ensure sodium is ready
      await sodium.ready;

      // Get payload from request body
      const payload = req.body || {};

      // Get keys and subscriber details from environment
      const signingPrivateKey = process.env.ONDC_SIGNING_PRIVATE_KEY;
      const subscriberId = process.env.ONDC_SUBSCRIBER_ID;
      const uniqueKeyId = process.env.ONDC_UNIQUE_KEY_ID || 'default-key';

      if (!signingPrivateKey) {
        throw new Error('Signing private key not found');
      }

      const created = Math.floor(Date.now() / 1000);
      const expires = created + 300;

      // Create digest of the payload
      const digest = this.createDigest(payload);

      // Create signing string
      const signingString = this.createSigningString(digest, created, expires);

      // Sign the signing string
      const signature = this.signMessage(signingString, signingPrivateKey);

      // Construct authorization header
      const authHeader = `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519", algorithm="ed25519", created="${created}", expires="${expires}", headers="(created)(expires)digest", signature="${signature}"`;

      // If called as a route handler, send JSON response
      if (res) {
        return res.json({
          payload: payload,
          authorizationHeader: {
            Authorization: authHeader,
            created,
            expires,
            subscriberId,
            uniqueKeyId
          }
        });
      }

      // If called as a method, return header details
      return {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        created,
        expires
      };
    } catch (error) {
      console.error('Authorization Header Generation Error:', error);
      
      // If called as a route handler, send error response
      if (res) {
        return res.status(500).json({ 
          error: 'Failed to generate authorization', 
          details: error.message 
        });
      }

      // If called as a method, throw the error
      throw error;
    }
  }

  /**
   * Create digest of the payload
   * @param {Object} payload - Request payload
   * @returns {string} Base64 encoded digest
   */
  createDigest(payload) {
    // Handle empty or undefined payload
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto.createHash('sha256').update(payloadString).digest('base64');
  }

  /**
   * Create signing string
   * @param {string} digest - Base64 encoded digest
   * @param {number} created - Creation timestamp
   * @param {number} expires - Expiration timestamp
   * @returns {string} Signing string
   */
  createSigningString(digest, created, expires) {
    return `(created): ${created}
  (expires): ${expires}
  digest: BLAKE-512=${digestBase64}`
  }

  /**
   * Sign the signing string
   * @param {string} signingString - String to sign
   * @param {string} privateKey - Base64 encoded private key
   * @returns {string} Base64 encoded signature
   */
  signMessage(signingString, privateKey) {
    const signatureBytes = sodium.crypto_sign_detached(
      Buffer.from(signingString),
      sodium.from_base64(privateKey)
    );
    return sodium.to_base64(signatureBytes);
  }
}

module.exports = new AuthHeaderGenerator();