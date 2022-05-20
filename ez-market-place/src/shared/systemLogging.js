// Logging library

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

// Output the log to the system log
function logToSystem(severity, message, copyToConsole = (true || process.env.logForceToConsole)) {
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
        // Prep message
        const outSeverity = getIntToLevel(outSeverityInt).toUpperCase();
        const outTimestamp = new Date().toISOString();
        const outMessage = `${outTimestamp} | ${outSeverity} | ${message}`;

        // Send to Console
        if (copyToConsole === true || copyToConsole === 'true') {
          if (outSeverityInt >= 1 && outSeverityInt <= 3) {
            // Debug
            // Verbose
            // Information
            // eslint-disable-next-line no-console
            console.info(outMessage, outSeverityInt);
          } else if (outSeverityInt <= 4) {
            // Warning
            // eslint-disable-next-line no-console
            console.warn(outMessage, outSeverityInt);
          } else if (outSeverityInt <= 6) {
            // Error
            // Critical
            // eslint-disable-next-line no-console
            console.error(outMessage, outSeverityInt);
          }
        }
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
