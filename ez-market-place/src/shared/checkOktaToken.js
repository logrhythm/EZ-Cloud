// Load the Okta JWT functions
const OktaJwtVerifier = require('@okta/jwt-verifier');

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer: process.env.ISSUER,
  clientId: process.env.CLIENT_ID
});

// Load the System Logging functions
const { logToSystem } = require('./systemLogging');

// Check if the Creds are valid, by trying checking them with Okta
async function checkCredentials(oktaToken) {
  const response = {
    username: '',
    valid: false
  };
  // logToSystem('Debug', `checkCredentials - ${oktaToken}`);
  if (oktaToken && oktaToken.length) {
    try {
      const oktaVerifier = await oktaJwtVerifier.verifyAccessToken(oktaToken, 'api://default');
      logToSystem('Debug', `checkCredentials - oktaVerifier - ${JSON.stringify(oktaVerifier)}`);
      // Check if the oktaVerifier is valid
      if (oktaVerifier) { // XXXX
        response.username = 'boop'; // XXXX
        response.valid = true;
      }
    } catch (error) {
      // logToSystem('Error', `checkCredentials - oktaJwtVerifier - ${JSON.stringify(error)}`);
      logToSystem('Error', `checkCredentials - oktaJwtVerifier - ${error.message}`);
    }
  }
  return response;
}

// Check for Authentication token, and if a valid one is found, extract the username from it
function checkJwTokenAndSetUser(req, res, next) {
  const authHeader = req.get('Authorization');
  if (authHeader && authHeader.length) {
    const token = String(authHeader).replace(/^Bearer /, '');
    if (token) {
      // logToSystem('Debug', `checkJwTokenAndSetUser - ${token}`);
      const checkedCreds = checkCredentials(token);
      logToSystem('Debug', `checkJwTokenAndSetUser - Response - ${JSON.stringify(checkedCreds)}`);
    }
  }
  next();

  // const authHeader = req.get('Authorization');
  // if (authHeader && authHeader.length && configJwt && configJwt.secret && configJwt.secret.length) {
  //   const token = String(authHeader).replace(/^Bearer /, '');
  //   if (token) {
  //     // use jwt lib to decode
  //     jwt.verify(token, configJwt.secret, (error, decodedPayload) => {
  //       // decodedPayload should contain something like:
  //       // {"username":"tmasse","roles":["Admin"],"iat":1637363428,"exp":1637449828}
  //       if (error) {
  //         logToSystem('Error', error);
  //       }
  //       logToSystem('Debug', `checkJwTokenAndSetUser - ${JSON.stringify(decodedPayload)}`);
  //       req.user = decodedPayload;
  //       next();
  //     });
  //   } else {
  //     next();
  //   }
  // } else {
  //   next();
  // }
}

module.exports = {
  checkCredentials,
  checkJwTokenAndSetUser
};
