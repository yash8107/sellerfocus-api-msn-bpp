const keyGenerator = require('../utils/keyGenerator');
const moment = require('moment');

class ONDCRegistrationController {
    async generateKeys(req, res) {
      try {
        const keyPairs = await keyGenerator.generateKeyPair();

        const now = moment(); // Add validity period (e.g., 1 year from generation)
        
        res.json({
          message: 'Keys generated successfully',
          unique_key_id: keyPairs.unique_key_id,
          signing_public_key: keyPairs.signing.publicKey,
          encryption_public_key: keyPairs.encryption.publicKey,
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

}
module.exports = new ONDCRegistrationController();