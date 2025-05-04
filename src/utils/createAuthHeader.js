// Create Authorization Header
const { hashMessage } = require('./hash');
const { createSigningString } = require('./signingString');
const { signMessage } = require('./sign');

function createAuthorizationHeader(req, res) {
  try {
    // Get body from request or use a default
    const body = req.body || {
      country: "IND",
      domain: "ONDC:RET11"
    };

    // Get parameters from environment or request
    const privateKey = process.env.ONDC_SIGNING_PRIVATE_KEY;
    const subscriberId = process.env.ONDC_SUBSCRIBER_ID;
    const keyId = process.env.ONDC_UNIQUE_KEY_ID || 'default-key';

    if (!privateKey || !subscriberId) {
      throw new Error('Missing required authorization parameters');
    }

    const created = Math.floor(Date.now() / 1000);
    const expires = created + 300;
    const digest = hashMessage(body);
    const signingString = createSigningString(digest, created, expires);
    const signature = signMessage(signingString, privateKey);

    const header = `Signature keyId="${subscriberId}|${keyId}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;

    // If called as a route handler, send JSON response
    if (res) {
      return res.json({
        payload: body,
        authorizationHeader: {
          Authorization: header,
          created,
          expires,
          subscriberId,
          keyId
        }
      });
    }

    return header;
  } catch (error) {
    console.error('Authorization Header Generation Error:', error);
    
    // If called as a route handler, send error response
    if (res) {
      return res.status(500).json({ 
        error: 'Failed to generate authorization', 
        details: error.message 
      });
    }

    throw error;
  }
}

module.exports = { createAuthorizationHeader };