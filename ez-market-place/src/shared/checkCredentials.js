const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.ISSUER,
  clientId: process.env.CLIENT_ID
});

// Check if the Creds are valid, by trying checking them with Okta
async function checkCredentials(oktaToken) {
  const response = {
    username: '',
    valid: false
  };
  console.log('oktaToken', oktaToken); // XXXX
  if (oktaToken && oktaToken.length) {
    try {
      const oktaVerifier = await oktaJwtVerifier.verifyAccessToken(oktaToken, 'api://default');
      console.log('oktaVerifier', oktaVerifier); // XXXX
      // Check if the oktaVerifier is valid
      if (oktaVerifier) { // XXXX
        response.username = 'boop'; // XXXX
        response.valid = true;
      }
    } catch (error) {
      //
    }
  }
  return response;
}

module.exports = checkCredentials;
