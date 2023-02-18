const MODES = {
  CONSOLE: 'console',
  FILE: 'file',
};
const LOG_LEVELS = {
  INFO: 'info',
  WARNING: 'warn',
  ERROR: 'error',
}
const COLORS = {
  INFO: '\x1b[0m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m',
}

function isNull(value) {
  return value === null;
}

module.exports = {
  MODES,
  LOG_LEVELS,
  COLORS,
  isNull,
};
