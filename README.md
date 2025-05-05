ONDC Key Generation Module
This module provides a robust and compliant mechanism for generating cryptographic key pairs for ONDC (Open Network for Digital Commerce) network participants. It supports the creation of secure Ed25519 signing keys and X25519 encryption keys required for participant registration and secure communication within the network.

🔐 Key Generation Specifications
Cryptographic Algorithms
Signing Key: Ed25519 (RFC 8032)

Encryption Key: X25519 (RFC 7748)

Key Pair Generation Process
Generate Ed25519 signing key pair (32-byte)

Generate X25519 encryption key pair (32-byte)

Encode X25519 public key in ASN.1 DER format

Store keys securely in .json and .env files

📁 Key Storage

File	Description
ondc-keys.json	Contains generated key pairs in structured JSON format
.env	Stores environment variables for accessing key details securely
🔑 Key Pair Structure
json
Copy
Edit
{
  "unique_key_id": "<UUID>",
  "signing": {
    "publicKey": "<Base64 Encoded>",
    "privateKey": "<Base64 Encoded>"
  },
  "encryption": {
    "publicKey": "<Base64 DER Encoded>",
    "privateKey": "<Base64 Encoded>"
  },
  "validFrom": "<ISO Timestamp>",
  "validUntil": "<ISO Timestamp>"
}
🧬 X25519 Public Key DER Encoding
Format: ASN.1 DER

Structure:

0x30: SEQUENCE

0x2A: Total length (42 bytes)

0x2B 0x65 0x70: OID for X25519 (1.3.101.110)

0x03: BIT STRING

0x21: Length: 33 bytes

0x00: 0 unused bits

Followed by: 32-byte public key

🔒 Security Recommendations
Keep private keys confidential

Rotate keys periodically

Use secure random number generators

Protect .env and ondc-keys.json using access controls

⚙️ Dependencies
libsodium-wrappers: For secure cryptographic operations

uuid: To generate unique key identifiers

🧪 Usage Example
javascript
Copy
Edit
const keyGenerator = require('./keyGenerator');

// Generate a new key pair
const keyPairs = await keyGenerator.generateKeyPair();
console.log(keyPairs);
✅ Compliance
Fulfills ONDC Registry public key submission requirements

Conforms to:

RFC 8032 – Ed25519

RFC 7748 – X25519

⚠️ Error Handling
Comprehensive error logging

Handles failures gracefully during secure key generation

