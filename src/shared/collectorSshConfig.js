// Get the SQL utils
const { getDataFromMsSql, createMsSqlVariables } = require('./sqlUtils');
// Get the crypto tools to work with password and keys
const { aesDecrypt } = require('./crypto');

async function getSshConfigForCollector(params) {
  const sshConfig = {
    host: '',
    port: 22
  };
  const queryResult = {};

  if (params && params.uid && params.uid.length) {
    await getDataFromMsSql({
      targetVariable: queryResult,
      query: `
      SELECT TOP 1
        [uid]
        ,[hostname]
        ,[port]
        ,[authenticationMethod]
        ,[username]
        ,[password]
        ,[privateKey]
      FROM [dbo].[openCollectors]
      WHERE [uid] = @uid
      ;
      `,
      variables: createMsSqlVariables(
        {
          body: {
            uid: params.uid
          }
        },
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });

    const collectorRecord = (
      queryResult
                && Array.isArray(queryResult.payload)
                && queryResult.payload.length
        ? queryResult.payload[0]
        : null
    );

    if (
      collectorRecord
      && collectorRecord.hostname
      && collectorRecord.hostname.length
      && collectorRecord.port
      && collectorRecord.port > 0
      && collectorRecord.port < 65536
      && collectorRecord.authenticationMethod
      && collectorRecord.authenticationMethod.length
      && (
        (
          collectorRecord.password
          && collectorRecord.password.length
        )
        || (
          collectorRecord.privateKey
          && collectorRecord.privateKey.length
        )
      )
    ) {
      // Valid record
      sshConfig.host = collectorRecord.hostname;
      sshConfig.port = collectorRecord.port;
      sshConfig.user = (
        collectorRecord.username
        && collectorRecord.username.length
        && collectorRecord.username !== null
          ? collectorRecord.username
          : undefined
      );
      sshConfig.pass = (
        collectorRecord.password
        && collectorRecord.password.length
        && collectorRecord.password !== null
          ? aesDecrypt(collectorRecord.password)
          : undefined
      );
      sshConfig.key = (
        collectorRecord.privateKey
        && collectorRecord.privateKey.length
        && collectorRecord.privateKey !== null
          ? aesDecrypt(collectorRecord.privateKey)
          : undefined
      );
    }
  }
  return sshConfig;
}

async function getCollectorSshConfigForPipeline(params) {
  const queryResult = {};
  let collectorUid = '';

  if (params && params.uid && params.uid.length) {
    await getDataFromMsSql({
      targetVariable: queryResult,
      query: `
      SELECT TOP 1 [primaryOpenCollector]
      FROM [dbo].[pipelines]
      WHERE [uid] = @uid
      ;
      `,
      variables: createMsSqlVariables(
        {
          body: {
            uid: params.uid
          }
        },
        [
          { name: 'uid', type: 'NVarChar' }
        ]
      )
    });

    const pipelineRecord = (
      queryResult
      && Array.isArray(queryResult.payload)
      && queryResult.payload.length
        ? queryResult.payload[0]
        : null
    );

    if (
      pipelineRecord
      && pipelineRecord.primaryOpenCollector
      && pipelineRecord.primaryOpenCollector.length
    ) {
      // Valid record
      collectorUid = pipelineRecord.primaryOpenCollector;
    }
  }
  return getSshConfigForCollector({ uid: collectorUid });
}

module.exports = {
  getSshConfigForCollector,
  getCollectorSshConfigForPipeline
};
