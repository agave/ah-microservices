const Kafka = require('/var/lib/app/node_modules/node-rdkafka');

class KafkaProducer {
  constructor(config) {
    this.producer = new Kafka.Producer(config);
    this.topic = config.topic;
    this.producer.on('error', this.errorHandler);
  }

  connect() {
    this.producer.connect();
    this.producer.on('ready', () => {
      this.ready = true;
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.ready) {
          return resolve();
        }
        return reject(`Unable to establish connection to host ${this.config['metadata.broker.list']}`);
      }, 1000)
    });
  }

  produce(message, guid) {
    return new Promise((resolve, reject) => {
      try {
        this.producer.produce(
          this.topic,
          message.id,
          new Buffer(message),
          guid,
          Date.now()
        );

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  errorHandler(err) {
    console.log(err);
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      this.producer.disconnect();
      this.producer.on('disconnect', () => resolve());
      this.producer.on('error', err => reject(err));
    });
  }
}

module.exports = KafkaProducer;
