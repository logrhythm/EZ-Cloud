const os = require('os');

const isWindowsPlatform = os.platform() === 'win32';

// For Windows platform, load the right module and create a logger for Windows Event Journal...
const { EventLogger } = (
  isWindowsPlatform
    ? require('node-windows')
    : { EventLogger: null }
);

const log = (
  isWindowsPlatform
    ? new EventLogger('EZ-Cloud Server')
    : null
);
// ...Windows

// For Non-Windows platforms...
const fs = (
  !isWindowsPlatform
    ? require('fs-extra')
    : null
);

// Stram handle
let logStream;

// End of line
const eol = os.EOL;

// ...Non-Windows

const levelToInt = {
  Debug: 1,
  Verbose: 2,
  Information: 3,
  Warning: 4,
  Error: 5,
  Critical: 6,
  Silent: 7
};

const intToLevel = {
  1: 'Debug',
  2: 'Verbose',
  3: 'Information',
  4: 'Warning',
  5: 'Error',
  6: 'Critical',
  7: 'Silent'
};

const minLevelInt = 1;
const maxLevelInt = 7;
const defaultLevelInt = 2; // Verbose
const defaultLevel = levelToInt[defaultLevelInt];

// Get you the Integer level for a string level (Warning -> 4) Default to defaultLevelInt.
function getLevelToInt(level) {
  if (level !== undefined && level.length) {
    return levelToInt[String(level).charAt(0).toUpperCase() + String(level).slice(1).toLowerCase()]
      || defaultLevelInt;
  }
  return defaultLevelInt;
}

// Get you the String level for a integer level (4 -> Warning). Default to defaultLevel.
function getIntToLevel(level) {
  if (level !== undefined && level >= minLevelInt && level <= maxLevelInt) {
    return intToLevel[level] || defaultLevel;
  }
  return defaultLevel;
}

// For Non-Windows platforms, prepare the log file
function openStream(logFilePath) {
  if (logStream !== undefined) {
    try {
      logStream.end();
    } catch (err) {
      //
    }
  }
  try {
    fs.createFileSync(logFilePath);
    logStream = fs.createWriteStream(logFilePath, { flags: 'a+' });
  } catch (err) {
    //
  }
}

// Output the log to the system log
function logToSystem(severity, message, copyToConsole = (false || String(process.env.logForceToConsole).toLowerCase().trim() === 'true')) {
  try {
    if (severity !== undefined && severity.length && message !== undefined && message.length) {
      const outSeverityInt = getLevelToInt(severity);
      const envLogLevel = Number(process.env.logLevel);
      if (outSeverityInt >= (
        process.env.logLevel !== undefined
        && envLogLevel >= minLevelInt
        && envLogLevel <= maxLevelInt
          ? envLogLevel
          : defaultLevelInt
      )) {
        const outSeverity = getIntToLevel(outSeverityInt).toUpperCase();
        const outTimestamp = new Date().toISOString();

        const outMessage = `${outTimestamp} | ${outSeverity} | ${message}`;
        // Send to Console
        if (copyToConsole) {
          // eslint-disable-next-line no-console
          console.error(outMessage);
        }

        // Send to system logs
        if (isWindowsPlatform) {
          // logger {
          //   source: 'EZ-Cloud Server',
          //   eventLog: [Getter/Setter],
          //   info: [Function: value],
          //   error: [Function: value],
          //   warn: [Function: value],
          //   auditSuccess: [Function: value],
          //   auditFailure: [Function: value]
          // }

          // Send to system logs
          if (outSeverityInt >= 1 && outSeverityInt <= 3) {
            // Debug
            // Verbose
            // Information
            log.info(outMessage, outSeverityInt);
          } else if (outSeverityInt <= 4) {
            // Warning
            log.warn(outMessage, outSeverityInt);
          } else if (outSeverityInt <= 6) {
            // Error
            // Critical
            log.error(outMessage, outSeverityInt);
          }
        } else if (process.env.logFilePath && process.env.logFilePath.length) {
          // Open the log file, if not already done
          if (logStream === undefined) {
            openStream(process.env.logFilePath);
          }
          logStream.write(`${outMessage}${eol}`);
        }
        // }
      }
    }
  } catch (err) {
    // Catch silently
  }
}

module.exports = {
  levelToInt,
  intToLevel,
  getLevelToInt,
  getIntToLevel,
  logToSystem
};
