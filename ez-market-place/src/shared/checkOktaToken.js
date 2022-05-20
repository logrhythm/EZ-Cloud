// Load the Okta JWT functions
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.ISSUER,
  clientId: process.env.CLIENT_ID
});

// Load the System Logging functions
const { logToSystem } = require('./systemLogging');

/**
 * Check if the Creds are valid, by trying checking them with Okta
 * @param {String} oktaToken Okta minted/provided JWT token
 * @returns A response object with {String} username, {Boolean} valid, {Object} verifierFullResponse
 */
async function checkOktaJwtToken(oktaToken) {
  const response = {
    username: '',
    valid: false,
    verifierFullResponse: null
  };
  logToSystem('Debug', `Okta Credentials Verification - Provided Okta Token: ${oktaToken}`);
  if (oktaToken && oktaToken.length) {
    try {
      const oktaVerifier = await oktaJwtVerifier.verifyAccessToken(oktaToken, 'api://default');
      logToSystem('Debug', `Okta Credentials Verification - oktaJwtVerifier response: ${JSON.stringify(oktaVerifier)}`);
      // Check if the oktaVerifier is valid
      if (oktaVerifier) {
        response.username = (oktaVerifier.claims ? oktaVerifier.claims.sub : '') || '';
        response.valid = true;
        response.verifierFullResponse = oktaVerifier;
      }
    } catch (error) {
      logToSystem('Error', `Okta Credentials Verification - ${error.name} - ${error.message} - ${JSON.stringify(error.innerError)}`);
    }
  }
  return response;
}

module.exports = {
  checkOktaJwtToken
};
