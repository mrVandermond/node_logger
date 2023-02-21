const { MODES, isNull, LOG_LEVELS, COLORS } = require('./utils');
const fs = require('fs');
const path = require('path');

class Logger {
  #mode = MODES.CONSOLE;
  #console = console;
  #filePath = '';
  #writableStream = null;
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

  end() {
    this.#writableStream.close();
  }

  async #doLog(logLevel, message) {
    switch (this.#mode) {
      case MODES.CONSOLE: {
        const colorAccordingToLogLevel = COLORS[logLevel.toUpperCase()];

        this.#console[logLevel](`${colorAccordingToLogLevel}${message}${COLORS.INFO}`);
        break;
      }
      case MODES.FILE: {
        const date = new Date().toLocaleString(this.#locale, this.#dateTimeFormatPreset);
        const messageWithLogLevel = `[${logLevel.toUpperCase()}, ${date}]: ${message} \n`;

        await this.#writeToFile(messageWithLogLevel);
        break;
      }
    }
  }

  #writeToFile(message) {
    return new Promise((res) => {
      const isReady = this.#writableStream.write(message);

      if (!isReady) {
        this.#writableStream.once('drain', res);

        return;
      }

      res();
    });
  }

  async #createStream() {
    const absolutePath = path.join(__dirname, this.#filePath);

    await fs.promises.access(absolutePath);

    const fileStat = await fs.promises.stat(absolutePath);
    const isFile = fileStat.isFile();

    if (!isFile) {
      throw new Error(`${absolutePath} is not a file`);
    }

    this.#writableStream = fs.createWriteStream(this.#filePath, {
      encoding: 'utf-8',
      flags: 'a',
      autoClose: false,
    });
  }

  async #startLogger() {
    if (this.#mode === MODES.FILE && !this.#writableStream) {
      await this.#createStream();
    }
  }
}

module.exports = Logger;
