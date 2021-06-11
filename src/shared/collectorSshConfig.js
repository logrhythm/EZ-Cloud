// Get the SQL utils
const { getDataFromSql, createSqlVariables } = require('./sqlUtils');
// Get the crypto tools to work with password and keys
const { aesDecrypt } = require('../shared/crypto');

async function getSshConfigForCollector (params) {
    const sshConfig = {
        host: '',
        port: 22
    };
    const queryResult = {};

    if (params && params.uid && params.uid.length) {
        // console.log('**** getDataFromSql - GO...');
        await getDataFromSql({
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
            variables: createSqlVariables(
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

        // console.log('**** getDataFromSql - DONE.');
        // console.log('**** queryResult:');
        // console.log(queryResult);

        // {
        //   stillChecking: false,
        //   errors: [],
        //   outputs: [ '1 row(s) returned' ],
        //   payload: [
        //     {
        //       uid: 'dd666d77-c301-4717-b62a-059accbf7b37',
        //       hostname: 'pass',
        //       port: 22,
        //       authenticationMethod: 'password',
        //       username: 'sa',
        //       password: 'U2FsdGVkX19tHAMWZl15RqL5IuuFk0dIMDK5rE7rAPg=',
        //       privateKey: 'null'
        //     }
        //   ]
        // }

        const collectorRecord = (
            queryResult
                && Array.isArray(queryResult.payload)
                && queryResult.payload.length
                ? queryResult.payload[0]
                : null
        );

        // console.log('**** collectorRecord:');
        // console.log(collectorRecord);

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
            // console.log('****    --> Valid record');
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

async function getCollectorSshConfigForPipeline (params) {
    const queryResult = {};
    let collectorUid = '';

    if (params && params.uid && params.uid.length) {
        await getDataFromSql({
            targetVariable: queryResult,
            query: `
      SELECT TOP 1 [primaryOpenCollector]
      FROM [dbo].[pipelines]
      WHERE [uid] = @uid
      ;
      `,
            variables: createSqlVariables(
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
