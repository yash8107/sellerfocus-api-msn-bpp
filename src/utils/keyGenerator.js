const sodium = require('libsodium-wrappers');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const fs = require('fs').promises;
const path = require('path');

class ONDCKeyGenerator {
    constructor() {
      this.keysPath = path.join(__dirname, '..', '..', 'ondc-keys.json');
    }

    async generateKeyPair() {
        await sodium.ready;
    
        // Generate Ed25519 signing key pair
        const signingKeyPair = sodium.crypto_sign_keypair();
        
        // Generate X25519 encryption key pair
        const encryptionKeyPair = sodium.crypto_box_keypair();
    
        // Prepare key pair object
        const keyPairs = {
          unique_key_id: uuidv4(),
          signing: {
            privateKey: sodium.to_base64(signingKeyPair.privateKey),
            publicKey: sodium.to_base64(signingKeyPair.publicKey)
          },
          encryption: {
            privateKey: sodium.to_base64(encryptionKeyPair.privateKey),
            publicKey: sodium.to_base64(encryptionKeyPair.publicKey)
          },
          validFrom: moment().toISOString(),
          validUntil: moment().add(1, 'year').toISOString()
        };
    
        // Save keys to a JSON file
        await fs.writeFile(this.keysPath, JSON.stringify(keyPairs, null, 2));
    
        return keyPairs;
      }

    async decryptChallenge(encryptedChallenge, encryptionPrivateKey) {
      await sodium.ready;
  
      console.log("Encrypted challenge:", encryptedChallenge);
      console.log("Encryption private key:", encryptionPrivateKey);
      // Decrypt challenge using encryption private key
      const decryptedChallenge = sodium.crypto_box_seal_open(
        sodium.from_base64(encryptedChallenge),
        sodium.from_base64(encryptionPrivateKey)
      );
  
      console.log("Decrypted challenge:", Buffer.from(decryptedChallenge).toString());
      return Buffer.from(decryptedChallenge).toString();
    }
} 

module.exports = new ONDCKeyGenerator();