const keyGenerator = require('../utils/keyGenerator');
const moment = require('moment');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const sodium = require('libsodium-wrappers');
const createAuthorizationHeader = require('../utils/createAuthHeader');

class ONDCRegistrationController {
  async generateKeys(req, res) {
    try {
      const keyPairs = await keyGenerator.generateKeyPair();

      const now = moment(); // Add validity period (e.g., 1 year from generation)

      res.json({
        message: 'Keys generated successfully',
        unique_key_id: keyPairs.unique_key_id,
        signing_public_key: keyPairs.signing.publicKey,
        signing_private_key: keyPairs.signing.privateKey,
        encryption_public_key: keyPairs.encryption.publicKey,
        encryption_private_key: keyPairs.encryption.privateKey,
        valid_from: now.toISOString(),
        //   valid_from: keyPairs.validFrom,
        valid_until: now.add(1, 'year').toISOString()
        //   valid_until: keyPairs.validUntil
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate keys',
        details: error.message
      });
    }
  }

  async subscribe(req, res) {
    try {
      // Load generated keys
      const keys = await keyGenerator.loadKeys();
      if (!keys) {
        return res.status(400).json({ error: 'No keys generated' });
      }

      // Prepare subscription payload
      // const subscriptionPayload = {
      //   context: {
      //     operation: {
      //       ops_no: req.body.ops_no || 3 // Default to new entity registration
      //     }
      //   },
      //   message: {
      //     request_id: req.body.request_id || keys.unique_key_id,
      //     timestamp: new Date().toISOString(),
      //     entity: {
      //       // Add entity details from request or use defaults
      //       subscriber_id: ondcConfig.subscriber.id,
      //       country: ondcConfig.subscriber.country,
      //       callback_url: ondcConfig.subscriber.callbackUrl,
      //       key_pair: {
      //         signing_public_key: keys.signing.publicKey,
      //         encryption_public_key: keys.encryption.publicKey,
      //         valid_from: keys.validFrom,
      //         valid_until: keys.validUntil
      //       }
      //     },
      //     network_participant: [{
      //       subscriber_url: ondcConfig.subscriber.url,
      //       domain: ondcConfig.subscriber.domain,
      //       type: ondcConfig.subscriber.type,
      //       city_code: [ondcConfig.subscriber.cityCode]
      //     }]
      //   }
      // };

      // Send subscription request to ONDC registry
      const response = await axios.post(
        ondcConfig.registry.subscribeUrl,
        req.body,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      res.json({
        message: 'Subscription request sent',
        response: response.data
      });
    } catch (error) {
      console.error('Subscription Error:', error.response ? error.response.data : error.message);
      res.status(500).json({
        error: 'Subscription failed',
        details: error.response ? error.response.data : error.message
      });
    }
  }

  async lookup(req, res) {
    try {
      // const lookupPayload = {
      //   subscriber_id: req.body.subscriber_id,
      //   country: req.body.country || ondcConfig.subscriber.country,
      //   city: req.body.city || ondcConfig.subscriber.cityCode,
      //   domain: req.body.domain || ondcConfig.subscriber.domain,
      //   type: req.body.type || ondcConfig.subscriber.type
      // };

      const response = await axios.post(
        // ondcConfig.registry.lookupUrl,
        req.body,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error('Lookup Error:', error.response ? error.response.data : error.message);
      res.status(500).json({
        error: 'Lookup failed',
        details: error.response ? error.response.data : error.message
      });
    }
  }

  async onSubscribeCallback(req, res) {
    try {
      console.log("Callback received from ONDC:", req.body);
      const { subscriber_id, challenge } = req.body;

      // Load keys
      const keys = await keyGenerator.loadKeys();
      if (!keys) {
        return res.status(400).json({ error: 'No keys found' });
      }

      // Decrypt challenge
      const decryptedChallenge = await keyGenerator.decryptChallenge(
        challenge,
        keys.encryption.privateKey
      );

      // Respond with decrypted challenge
      const responsePayload = {
        answer: decryptedChallenge
      };

      // Generate authorization header
      const authHeader = createAuthorizationHeader({ body: responsePayload });

      // Prepare request configuration
      const requestConfig = {
        method: 'post',
        url: process.env.ONDC_REGISTRY_URL + '/on_subscribe',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        data: responsePayload
      };

      // Make the request
      const response = await axios(requestConfig);

      // Return successful response
      res.json(response.data);
    } catch (error) {
      res.status(500).json({
        error: 'Callback processing failed',
        details: error.message
      });
    }
  }

  async siteVerification(req, res) {
    try {
      console.log('Site Verification Endpoint Called');
      // Load keys from JSON file
      // Use environment variables for keys
      const signingPrivateKey = process.env.ONDC_SIGNING_PRIVATE_KEY;

      if (!signingPrivateKey) {
        throw new Error('No signing private key found. Generate keys first.');
      }
      // Generate a unique request ID (you can modify this logic as needed)
      const requestId = uuidv4();

      // Prepare content to be signed
      await sodium.ready;
      const signatureBytes = sodium.crypto_sign_detached(
        Buffer.from(requestId),
        sodium.from_base64(signingPrivateKey)
      );

      // Convert signature to base64
      const SIGNED_UNIQUE_REQ_ID = sodium.to_base64(signatureBytes);

      // HTML template for verification
      const htmlFile = `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="ondc-site-verification"
      content="${SIGNED_UNIQUE_REQ_ID}"
    />
    <title>ONDC Site Verification</title>
  </head>
  <body>
    <h1>ONDC Site Verification</h1>
  </body>
</html>
      `;

      // Set content type to HTML
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(htmlFile);

    } catch (error) {
      console.error('Site Verification Error:', error);
      res.status(500).json({
        error: 'Site verification failed',
        details: error.message
      });
    }
  }

}
module.exports = new ONDCRegistrationController();