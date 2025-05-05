# sellerfocus-api-msn-bpp


ONDC Key Generation README
Overview
This module provides a robust key generation mechanism for ONDC (Open Network for Digital Commerce) network participants, focusing on creating cryptographically secure Ed25519 signing and X25519 encryption key pairs.

Key Generation Specifications
Cryptographic Algorithms
Signing Key: Ed25519
Encryption Key: X25519
Key Pair Generation Process
Generate Ed25519 signing key pair (32-byte keys)
Generate X25519 encryption key pair (32-byte keys)
Encode X25519 public key in ASN.1 DER format
Store keys securely in JSON and environment files
Key Storage Locations
JSON File: ondc-keys.json
Environment File: .env
Key Pair Structure
json
CopyInsert
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
X25519 Public Key Encoding
Encoding: ASN.1 DER
Format Details:
0x30: SEQUENCE
0x2A: Total length (42 bytes)
0x2B, 0x65, 0x70: OID for X25519 (1.3.101.110)
0x03: BIT STRING
0x21: Length 33 bytes
0x00: 0 unused bits
Security Recommendations
Keep private keys confidential
Rotate keys periodically
Use secure random number generation
Protect key storage mechanisms
Dependencies
libsodium-wrappers: Cryptographic operations
uuid: Unique key ID generation
Usage Example
javascript
CopyInsert
const keyGenerator = require('./keyGenerator');

// Generate new key pair
const keyPairs = await keyGenerator.generateKeyPair();
Compliance
Adheres to ONDC registry key submission requirements
Follows RFC 8032 (Ed25519) and RFC 7748 (X25519) specifications
Error Handling
Comprehensive error logging
Secure key generation failure management