const Kafka = require('/var/lib/app/node_modules/node-rdkafka');
const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);

class KafkaProducer {
  constructor(config) {
    this.topicName = config.topic;
    this.producer = new Kafka.Producer(config);

    this.producer.on('error', err => this.errorHandler(err));
    this.producer.on('disconnect', () => log.warn('Producer disconnected'));
    this.producer.on('event.log', e => log.message('Producer event', e, 'ProducerInfo'));
    this.producer.on('delivery-report', report => {
      log.message('Producer delivery-report', report, 'ProducerInfo');
    });
  }

  connect() {
    this.producer.connect();
    this.producer.on('ready', () => {
      this.ready = true;
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => this.ready ? resolve() : reject('Connection failed'), 1000);
    });
  }

  produce({ message, key }) {
    return new Promise((resolve, reject) => {
      try {
        this.producer.produce(
          this.topicName,
          null,
          new Buffer(JSON.stringify(message)),
          key
        );

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  errorHandler(err) {
    log.error(err, '', {
      msg: 'Producer error'
    });
  }

  disconnect() {
    this.producer.disconnect();
  }
}

module.exports = KafkaProducer;
