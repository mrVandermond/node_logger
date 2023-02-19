const { MODES, isNull, LOG_LEVELS, COLORS } = require('./utils');
const fs = require('fs/promises');

class Logger {
  #mode = MODES.CONSOLE;
  #console = console;
  #filePath = '';
  #locale = 'ru-RU';
  #dateTimeFormatPreset = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  };

  constructor(mode, options) {
    const hasMode = typeof mode !== 'undefined';
    const hasOptions = typeof options !== 'undefined';

    if (!hasMode && !hasOptions) return;

    if (hasMode) {
      this.#mode = mode;
    }

    if (hasOptions) {
      this.#locale = options.locale ?? this.#locale;
      this.#filePath = options.filePath ?? this.#filePath;
      this.#dateTimeFormatPreset = options.dateTimeFormatPreset ?? this.#dateTimeFormatPreset;
    }
  }

  log(message) {
    if (typeof message === 'string') {
      this.#chooseSourceAndLog(LOG_LEVELS.INFO, message);

      return;
    }

    if (typeof message === 'object' && !isNull(message)) {
      this.#chooseSourceAndLog(message.level, message.message);
    }
  }

  async #chooseSourceAndLog(logLevel, message) {
    switch (this.#mode) {
      case MODES.CONSOLE: {
        const colorAccordingToLogLevel = COLORS[logLevel.toUpperCase()];

        this.#console[logLevel](`${colorAccordingToLogLevel}${message}${COLORS.INFO}`);
        break;
      }
      case MODES.FILE: {
        try {
          const file = await fs.open(this.#filePath, 'a+');
          const date = new Date().toLocaleString(this.#locale, this.#dateTimeFormatPreset);
          const messageWithLogLevel = `[${logLevel.toUpperCase()}, ${date}]: ${message} \n`;

          await file.appendFile(messageWithLogLevel, {
            encoding: 'utf-8',
          });
          await file.close();
        } catch (error) {
          console.error(error);
        }
        break;
      }
    }
  }
}

module.exports = Logger;
