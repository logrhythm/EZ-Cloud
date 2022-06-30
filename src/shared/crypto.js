const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

const secret = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'secure.json'), 'utf8')).aes_secret;

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

// For RSA encryption for EZ Market Place
const crypto = require('crypto');

function encryptStringWithRsaPublicKey(ezMarketRsaPublicKey, toEncrypt) {
  let base64EncodedEncryptedMessage = '';
  try {
    const buffer = Buffer.from(toEncrypt);
    const encrypted = crypto.publicEncrypt(ezMarketRsaPublicKey, buffer);
    base64EncodedEncryptedMessage = encrypted.toString('base64');
  } catch (error) {
    // Fail silenctly
  }
  return base64EncodedEncryptedMessage;
}

// Calling external LogRhythm tool to obfuscate secrets in configuration files

const spawn = require('cross-spawn');

const encryptionToolPath = (
  process.env.NODE_ENV === 'development'
    ? path.join(process.env.baseDirname, 'src', 'shared', 'encryptionTool.exe')
    : path.join(process.env.baseDirname, 'bin', 'encryptionTool.exe')
);

function lrObfuscateSecret(toObfuscate = '') {
  const obfuscationResult = spawn.sync(encryptionToolPath, [toObfuscate, 'encrypt', ''], {});
  const obfuscatedSecret = (obfuscationResult && obfuscationResult.error === null && obfuscationResult.stdout ? obfuscationResult.stdout : '').toString().trim();
  return obfuscatedSecret;
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  encryptStringWithRsaPublicKey,
  lrObfuscateSecret
};
