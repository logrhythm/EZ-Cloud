// const { log } = require('node:console');

const { Connection, Request } = require('tedious');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('../config/database.json', 'utf8')).config;

// config.options.requestTimeout = 30 * 1000; // 30 seconds
config.options.debug = {
  data: false,
  payload: false,
  token: false,
  packet: false,
  log: false
};

const connection = new Connection(config);

connection.connect(connected);
connection.on('infoMessage', infoError);
connection.on('errorMessage', infoError);
connection.on('end', end);
connection.on('debug', debug);

function connected(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('connected');

  exec('SELECT [Major], [Minor], [Patch], [Revision], [DateUpdated] FROM [LogRhythmEMDB].[dbo].[SCDBVersion];');

  process.stdin.resume();

  process.stdin.on('data', function(chunk) {
    exec(chunk);
  });

  process.stdin.on('end', function() {
    process.exit(0);
  });
}

function exec(sql) {
  sql = sql.toString();

  const request = new Request(sql, statementComplete);
  request.on('columnMetadata', columnMetadata);
  request.on('row', row);
  request.on('done', requestDone);

  connection.execSql(request);
}

function requestDone(rowCount, more) {
  console.log(rowCount + ' rows');
}

function statementComplete(err, rowCount) {
  if (err) {
    console.log('Statement failed: ' + err);
  } else {
    console.log(rowCount + ' rows');
  }
}

function end() {
  console.log('Connection closed');
  process.exit(0);
}

function infoError(info) {
  console.log(info.number + ' : ' + info.message);
}

function debug(message) {
  console.log('\x1b[33m%s\x1b[0m', message);
}

function columnMetadata(columnsMetadata) {
//   columnsMetadata.forEach((column) => {
//     console.log(column);
//   });
}

function row(columns) {
  let values = '';
  let value;

  columns.forEach((column) => {
    if (column.value === null) {
      value = 'NULL';
    } else {
      value = column.value;
    }

    values += value + '\t';
  });

  console.log(values);
}