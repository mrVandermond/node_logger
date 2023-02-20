const { MODES, isNull, LOG_LEVELS, COLORS } = require('./utils');
const fs = require('fs/promises');

class Logger {
  #mode = MODES.CONSOLE;
  #console = console;
  #filePath = '';
  #fileHandle = null;
  #timeToCloseFile = 1000;
  #timeTick = 50;
  #scheduledCloseId = null;
  #isProcessOfOpeningFile = false;
  #queue = [];
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
      this.#timeToCloseFile = options.timeToCloseFile ?? this.#timeToCloseFile;
    }

    this.#startLogger();
  }

  log(message) {
    if (typeof message === 'string') {
      this.#doLog(LOG_LEVELS.INFO, message);

      return;
    }

    if (typeof message === 'object' && !isNull(message)) {
      this.#doLog(message.level, message.message);
    }
  }

  #doLog(logLevel, message) {
    switch (this.#mode) {
      case MODES.CONSOLE: {
        const colorAccordingToLogLevel = COLORS[logLevel.toUpperCase()];

        this.#console[logLevel](`${colorAccordingToLogLevel}${message}${COLORS.INFO}`);
        break;
      }
      case MODES.FILE: {
        const date = new Date().toLocaleString(this.#locale, this.#dateTimeFormatPreset);
        const messageWithLogLevel = `[${logLevel.toUpperCase()}, ${date}]: ${message} \n`;

        this.#queue.push(messageWithLogLevel);
        break;
      }
    }
  }

  async #openOrKeepHoldFile() {
    if (this.#fileHandle) {
      await this.#scheduleCloseFile();

      return;
    }

    try {
      this.#isProcessOfOpeningFile = true;

      this.#fileHandle = await fs.open(this.#filePath, 'a+');

      this.#isProcessOfOpeningFile = false;
      this.#scheduleCloseFile();
    } catch (error) {
      console.error(error);
    }
  }

  #scheduleCloseFile() {
    if (this.#scheduledCloseId) {
      clearTimeout(this.#scheduledCloseId);
      this.#scheduledCloseId = null;
    }

    this.#scheduledCloseId = setTimeout(async () => {
      if (!this.#fileHandle) return;

      console.log('close file');

      await this.#fileHandle.close();
      this.#fileHandle = null;
    }, this.#timeToCloseFile);
  }

  async #writeToFile(message) {
    await this.#fileHandle.appendFile(message, {
      encoding: 'utf-8',
    });
  }

  #startLogger() {
    setTimeout(async () => {
      this.#startLogger();

      if (this.#queue.length === 0) return;

      try {
        await this.#openOrKeepHoldFile();

        for (let i = 0; i < 50; i++) {
          const message = this.#queue[i];

          await this.#writeToFile(message);
        }

        this.#queue.splice(0, 50);
      } catch (error) {
        console.error(error);
      }
    }, this.#timeTick);
  }
}

module.exports = Logger;
