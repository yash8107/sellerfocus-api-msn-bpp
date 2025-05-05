const sodium = require('libsodium-wrappers');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class ONDCKeyGenerator {
    constructor() {
        this.keysPath = path.join(__dirname, '..', '..', 'ondc-keys.json');
    }

    async generateKeyPair() {
        try {
            // Ensure sodium is ready
            await sodium.ready;

            // Generate Ed25519 signing key pair (32-byte keys)
            const signingKeyPair = sodium.crypto_sign_keypair();
            
            // Generate X25519 encryption key pair (32-byte keys)
            const encryptionKeyPair = sodium.crypto_box_keypair();

            // Precise ASN.1 DER encoding for X25519 public key
            const derEncodedPublicKey = this.encodeX25519PublicKey(encryptionKeyPair.publicKey);

            // Prepare key pair object with base64 encoded keys
            const keyPairs = {
                unique_key_id: uuidv4(),
                signing: {
                    publicKey: sodium.to_base64(signingKeyPair.publicKey, sodium.base64_variants.ORIGINAL),
                    privateKey: sodium.to_base64(signingKeyPair.privateKey, sodium.base64_variants.ORIGINAL)
                },
                encryption: {
                    publicKey: sodium.to_base64(derEncodedPublicKey, sodium.base64_variants.ORIGINAL),
                    privateKey: sodium.to_base64(encryptionKeyPair.privateKey, sodium.base64_variants.ORIGINAL)
                },
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            };

            // Save keys to a JSON file
            await fs.writeFile(this.keysPath, JSON.stringify(keyPairs, null, 2));

            // Store keys in .env file
            await this.storeKeysInEnv(keyPairs);

            return keyPairs;
        } catch (error) {
            console.error('Key generation failed:', error);
            throw error;
        }
    }

  async storeKeysInEnv(keyPairs) {
    const envContent = `
ONDC_UNIQUE_KEY_ID=${keyPairs.unique_key_id}
ONDC_SIGNING_PUBLIC_KEY=${keyPairs.signing.publicKey}
ONDC_SIGNING_PRIVATE_KEY=${keyPairs.signing.privateKey}
ONDC_ENCRYPTION_PUBLIC_KEY=${keyPairs.encryption.publicKey}
ONDC_ENCRYPTION_PRIVATE_KEY=${keyPairs.encryption.privateKey}
`;

    await fs.writeFile(path.join(__dirname, '..', '..', '.env'), envContent, { flag: 'w' });
  }

    // Precise ASN.1 DER encoding for X25519 public key
    encodeX25519PublicKey(publicKey) {
      // Detailed ASN.1 DER encoding for X25519 public key
      const asn1Header = new Uint8Array([
          0x30,       // SEQUENCE
          0x2A,       // Length 42 bytes
          0x30,       // SEQUENCE
          0x05,       // Length 5 bytes
          0x06,       // OBJECT IDENTIFIER
          0x03,       // Length 3 bytes
          0x2B, 0x65, 0x70,  // OID for X25519 (1.3.101.110)
          0x03,       // BIT STRING
          0x21,       // Length 33 bytes
          0x00,       // 0 unused bits
      ]);

      // Combine header with public key
      const derEncodedKey = new Uint8Array(asn1Header.length + publicKey.length);
      derEncodedKey.set(asn1Header);
      derEncodedKey.set(publicKey, asn1Header.length);

      return derEncodedKey;
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