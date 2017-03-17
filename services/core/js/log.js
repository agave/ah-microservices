const winston = require('/var/lib/app/node_modules/winston/lib/winston');

class Log {
  constructor(module) {
    this.log = new winston.Logger({
      transports: [
        new winston.transports.Console({
          level: 'debug',
          label: this.getFilePath(module),
          handleException: true,
          json: false,
          colorize: true,
          timestamp: true,
          formatter: options => {
            const info = {
              level: options.level.toUpperCase(),
              data: options.meta
            };

            info.data.timestamp = new Date().getTime();

            return JSON.stringify(info);
          }
        })
      ],
      exitOnError: false
    });
  }

  getFilePath(module) {
    return module.filename.split('/').slice(-2).join('/');
  }

  message(msg, data = {}, type = '', guid = '') {
    const obj = {
      guid,
      type,
      msg,
      data: JSON.stringify(data)
    };

    this.log.info(obj);
  }

  error(e, guid = '', extraData = {}) {
    const obj = {
      guid,
      msg: e.message,
      stack: e.stack,
      data: JSON.stringify(extraData)
    };

    this.log.error(obj);
  }

  warn(msg, data = '', guid = '') {
    const obj = {
      guid,
      msg,
      data: JSON.stringify(data)
    };

    this.log.warn(obj);
  }
}

module.exports = Log;
