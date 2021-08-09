// Get SQL config
const fs = require('fs');
const path = require('path');

const configSql = JSON.parse(fs.readFileSync(path.join(process.env.baseDirname, 'config', 'database.json'), 'utf8')).config;
// Create SQL object
const { Connection, Request, TYPES } = require('tedious');

function waitMilliseconds (delay = 250) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

const maxCheckInterval = 10; // Check once every X seconds max, and/or timeout after X seconds

// For passwords and tokens cyphering
const secretPlaceholder = '** PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER - PLACEHOLDER **';

//        ##     ## ######## #### ##       #### ######## #### ########  ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ######    ######
//        ##     ##    ##     ##  ##        ##     ##     ##  ##             ##
//        ##     ##    ##     ##  ##        ##     ##     ##  ##       ##    ##
//         #######     ##    #### ######## ####    ##    #### ########  ######

// ##########################################################################################
// getDataFromSql
// #########
// Utilitarian function to get the data from
// SQL using parameters.query and dump it in the
// parameters.targetVariable
// ##########################################################################################

async function getDataFromSql (parameters) {
    let stillChecking = true;
    if (parameters && parameters.query && parameters.query.length && parameters.targetVariable) {
        const { targetVariable, query, variables } = parameters;
        targetVariable.stillChecking = true;
        targetVariable.errors = [];
        targetVariable.outputs = [];
        targetVariable.payload = [];

        // Connect
        const connection = new Connection(configSql);

        // Connection event handler
        connection.on('connect', (connectionError) => {
            if (connectionError) {
                targetVariable.errors.push('Connection to database failed');
                targetVariable.stillChecking = false;
                stillChecking = false;
                // throw connectionError;
            }

            // Exec the query
            const request = new Request(query, (err, rowCount) => {
                if (err) {
                    targetVariable.errors.push(err);
                }
                if (rowCount) {
                    targetVariable.outputs.push(`${rowCount} row(s) returned`);
                }
                targetVariable.stillChecking = false;
                stillChecking = false;
            });

            if (variables && Array.isArray(variables)) {
                variables.forEach((variable) => {
                    if (variable.name && variable.name.length > 0) {
                        // request.addParameter(variable.name, TYPES[variable.type], (variable.value || null));
                        request.addParameter(
                            variable.name,
                            TYPES[variable.type],
                            (
                                // eslint-disable-next-line no-nested-ternary
                                (variable.value !== undefined) && (variable.value !== null)
                                    ? (
                                        typeof variable.value === 'object'
                                            ? JSON.stringify(variable.value)
                                            : variable.value
                                    )
                                    : null
                            )
                        );
                        // if (typeof variable.value === 'string') {
                        //   request.addParameter(variable.name, TYPES.NVarChar, (variable.value || null));
                        // }
                        // if (typeof variable.value === 'number') {
                        //   request.addParameter(variable.name, TYPES.Int, (variable.value || null));
                        // }
                        // if (typeof variable.value === 'boolean') {
                        //   request.addParameter(variable.name, TYPES.TinyInt, (variable.value > 0));
                        // }
                        // if (variable.value === null) {
                        //   request.addParameter(variable.name, TYPES.Null, null);
                        // }
                    }
                });
            }

            request.on('row', (columns) => {
                // Make sure targetVariable.payload is an array
                if (!targetVariable.payload || targetVariable.payload === null) {
                    targetVariable.payload = [];
                }

                // Compile the row using all its columns
                const row = {};
                columns.forEach((column) => {
                    row[column.metadata.colName] = column.value;
                });
                targetVariable.payload.push(row);
            });

            // And run it
            connection.execSql(request);
        });

        // Kick it all off!
        connection.connect();

        // Wait, by default, for the query to happen (or fail) before returning to caller
        if (!parameters.noWait) {
            const loopEndTime = Date.now() / 1000 + maxCheckInterval;

            // Waiting - Sync
            while (targetVariable.stillChecking && (loopEndTime > (Date.now() / 1000))) {
                // Wait for 50 ms
                // eslint-disable-next-line no-await-in-loop
                await waitMilliseconds(50);
            }
            if (stillChecking || targetVariable.stillChecking) {
                targetVariable.errors.push('Timeout');
            }
            targetVariable.stillChecking = false;
            stillChecking = false;
        }
    }
}

// ##########################################################################################
// createSqlVariables
// #########
// Utilitarian function to create the array of
// fields type mapping to be provided to
// getDataFromSql as parameters.targetVariable
// ##########################################################################################

function createSqlVariables (req, definitions) {
    const variables = [];
    if (req && (req.query || req.body) && definitions && Array.isArray(definitions)) {
        definitions.filter((def) => def.name && def.type && def.name.length && def.type.length)
            .forEach((def) => {
                variables.push({
                    name: def.name,
                    type: def.type,
                    /* eslint-disable no-nested-ternary */
                    value: (
                        req.body && (req.body[def.name] !== undefined)
                            ? req.body[def.name]
                            : (
                                req.query && (req.query[def.name] !== undefined)
                                    ? req.query[def.name]
                                    : null
                            )
                    )
                    /* eslint-enable no-nested-ternary */
                });
            });
    }
    return variables;
}

// ##########################################################################################
// createSqlVariablesAndStoredProcParams
// #########
// Utilitarian function to create the array of
// fields type mapping to be provided to
// getDataFromSql as parameters.targetVariable
// using createSqlVariables() and trimming any
// entry with a NULL or Undefined value.
//
// Useful when calling Stored Procedures that
// expect missing parameters to fall back on
// default values.
// ##########################################################################################

function createSqlVariablesAndStoredProcParams (req, definitions, weedOut = true) {
    // Prep SQL Variables
    const sqlVariablesRaw = createSqlVariables(req, definitions);

    // Weed out all the ones with NULL or Undefined
    // This is done as the SQL Stored Procedure will use default values if a param is not provided
    // But by default, createSqlVariables() puts NULL, and that's no good

    const storedProcedureParams = [];
    const sqlVariables = []

    sqlVariablesRaw.forEach((variable) => {
        if ((variable.value !== undefined && variable.value !== null) || weedOut === false) {
            sqlVariables.push(variable);
            storedProcedureParams.push(`@${variable.name} = @${variable.name}`)
        }
    })

    return [ sqlVariables, storedProcedureParams ];
}

module.exports = {
    getDataFromSql,
    createSqlVariables,
    createSqlVariablesAndStoredProcParams
};
