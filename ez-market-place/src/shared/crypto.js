const fs = require('fs');
const path = require('path');
// For RSA decryption
const crypto = require('crypto');

const privateKey = fs.readFileSync(path.join(process.env.baseDirname, 'certificates', 'ez-market-place.key.pem'), 'utf8');

function decryptStringWithRsaPrivateKey(toDecrypt) {
  let decryptedString = '';
  try {
    const buffer = Buffer.from(toDecrypt, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    decryptedString = decrypted.toString('utf8');
  } catch (error) {
    // Fails silently
  }
  return decryptedString;
}

module.exports = {
  decryptStringWithRsaPrivateKey
};
