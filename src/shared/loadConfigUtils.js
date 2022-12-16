// Get JSON file
const fs = require('fs');
const path = require('path');

// Load the System Logging functions
const { logToSystem } = require('./systemLogging');

// Import SQL Utilities
const {
  getDataFromPgSql
} = require('./sqlUtils');

/**
 * Gather the SQL connection configuration for MS SQL.
 * If using MS SQL only, gather config from file, otherwise
 * collect it from a Table in PostgreSQL
 * @param {String} filename Full path to the database configuration file (for MS SQL)
 * @returns SQL connection configuration as an Object
 */
async function getConfig(filename) {
  // Full MS SQL: Get config from File
  if (
    process.env.databaseMode === 'mssql'
    && filename && filename.length
  ) {
    return JSON.parse(
      fs.readFileSync(
        path.join(process.env.baseDirname, 'config', filename), 'utf8'
      )
    );
  }

  // PgSQL and Split: Get config from PgSQL
  if (
    (
      process.env.databaseMode === 'pgsql'
      || process.env.databaseMode === 'split'
    )
    && filename && filename.length
  ) {
    try {
      const configFromSql = {};
      await getDataFromPgSql({
        targetVariable: configFromSql,
        query: 'SELECT "settingsJson" FROM public."settings" WHERE "name" = $1;',
        variables: [filename]
      });

      // Report on SQL Error, if any
      if (
        configFromSql
        && configFromSql.errors
        && Array.isArray(configFromSql.errors)
        && configFromSql.errors.length
      ) {
        logToSystem('Warning', 'Get Config | SQL Returned an error while pulling the Setting.');
        logToSystem('Debug', `Get Config | SQL Errors: ${JSON.stringify(configFromSql.errors)}.`);
      }

      const config = JSON.parse(
        (
          configFromSql
          && configFromSql.payload
          && Array.isArray(configFromSql.payload)
          && configFromSql.payload.length === 1
            ? configFromSql.payload[0].settingsJson || {}
            : {}
        )
      );

      // And ship out!!
      return config;
    } catch (error) {
      logToSystem('Error', `Persistance Layer | Connection to database (Pg) failed. | Details: ${error.message}`);
    }
  }

  logToSystem('Error', 'Database mode couldn\'t be determined or other error. Not returning any configuration.');
  // Fallback to a NULL value so it's easy for the caller to check validity of the config
  return null;
}

let cachedJwtConfig;
/**
 * Gather JWT configuration
 * @param {Boolean} ignoreCache True to not used the cachec value. Default False.
 * @returns JWT configuration as Object
 */
async function getJwtConfig(ignoreCache = false) {
  if (
    ignoreCache
    || !cachedJwtConfig
    || !(cachedJwtConfig && cachedJwtConfig.secret && cachedJwtConfig.secret.length)
  ) {
    logToSystem('Debug', `getJwtConfig(ignoreCache = ${ignoreCache}) - 🔑 - Cache miss. Getting configuration again.`);
    cachedJwtConfig = await getConfig('jwt.json');
  }
  return cachedJwtConfig;
}

let cachedEzMarketConfig;
async function getEzMarketConfig(ignoreCache = false) {
  if (
    ignoreCache
    || !cachedEzMarketConfig
    || !(
      cachedEzMarketConfig
      && cachedEzMarketConfig.server
      && cachedEzMarketConfig.server.baseUrl
      && cachedEzMarketConfig.server.baseUrl.length
    )
  ) {
    logToSystem('Debug', `getEzMarketConfig(ignoreCache = ${ignoreCache}) - 🛒 - Cache miss. Getting configuration again.`);
    cachedEzMarketConfig = await getConfig('ez-market-place.json');
  }
  return cachedEzMarketConfig;
}

module.exports = {
  getConfig,
  getJwtConfig,
  getEzMarketConfig
};
