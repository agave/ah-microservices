const Kafka = require('/var/lib/app/node_modules/node-rdkafka');
const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);

class KafkaConsumer {
  constructor(config) {
    const configClone = {};
    const offsetReset = config.offsetReset;

    Object.assign(configClone, config);

    this.topics = configClone.topics;

    delete configClone.topics;
    delete configClone.offsetReset;

    this.consumer = new Kafka.KafkaConsumer(configClone, {
      'auto.offset.reset': offsetReset
    });

    this.consumer.on('disconnect', () => log.warn('Consumer disconnected'));
    this.consumer.on('error', err => this.errorHandler(err));
    this.consumer.on('event.log', e => log.message('Consumer event', e, 'ConsumerInfo'));
  }

  connect(eventHandler) {
    this.consumer
    .on('ready', () => {
      this.ready = true;
      this.consumer.subscribe(this.topics);
      this.consumer.consume();
    })
    .on('data', data => this.dataHandler(data, eventHandler));

    this.consumer.connect();

    return new Promise((resolve, reject) => {
      setTimeout(() => this.ready ? resolve() : reject(new Error('Connection failed')), 3000);
    });
  }

  dataHandler(data, handler) {
    data.value = JSON.parse(data.value.toString());
    data.value.body = JSON.parse(data.value.body);

    return handler.handle(data)
    .then(() => this.commit(data))
    .catch(err => {
      const message = err ? err.message : 'no error info';

      log.error(err, data.value.guid, {
        msg: `Failed to handle ${data.topic} at offset ${data.offset}: ${message}`
      });
    });
  }

  commit(data) {
    data.offset = data.offset + 1;
    this.consumer.commit(data, err => {
      if (err) {
        return log.error(err, data.value.guid, {
          msg: `Failed to commit ${data.topic} at offset ${data.offset}`
        });
      }

      return true;
    });
  }

  errorHandler(err) {
    log.error(err, '', {
      msg: 'Consumer error'
    });
  }

  disconnect() {
    this.consumer.disconnect();
  }
}

module.exports = KafkaConsumer;
