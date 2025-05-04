function createSigningString(digestBase64, created, expires) {
    return `(created): ${created}
  (expires): ${expires}
  digest: BLAKE-512=${digestBase64}`;
  }
  
module.exports = { createSigningString };