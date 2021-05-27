const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const secret = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'config', 'secure.json'), 'utf8')).aes_secret;

if (!(secret && secret.length)) {
  // eslint-disable-next-line no-console
  console.warn('\x1b[31m%s\x1b[0m', 'WARNING - aes_secret not set in config/secure.json. This will impact encryption of passwords and tokens. DO FIX THIS ASAP.');
}

function aesEncrypt(toEncrypt = '') {
  return CryptoJS.AES.encrypt(toEncrypt, (secret || '')).toString();
}

function aesDecrypt(toDecrypt = '') {
  const decryptedBytes = CryptoJS.AES.decrypt(toDecrypt, (secret || ''));
  return decryptedBytes.toString(CryptoJS.enc.Utf8);
}

module.exports = {
  aesEncrypt,
  aesDecrypt
};
