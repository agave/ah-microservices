const kafkaProducer = require('../../../api/vendor/kafka-producer');
const KafkaConsumer = require('/var/lib/core/js/kafka-consumer');
const consumerConfig = require('../../../config').kafkaConsumer;

class ConsumerHelper {

  constructor(topics) {
    const config = {};

    Object.assign(config, consumerConfig);
    config.topics = topics;

    this.consumedEvents = [];
    this.kafkaConsumer = new KafkaConsumer(config);
  }

  setup() {
    return this.kafkaConsumer.connect(this);
  }

  handle(event) {
    this.consumedEvents.push(event);

    return Promise.resolve();
  }

  getNextEvent(retries = 0) {
    return new Promise((resolve, reject) => {

      if (this.consumedEvents.length === 0) {
        if (retries === 5) {
          return reject(new Error('No new events consumed'));
        }

        return setTimeout(() => {
          return this.getNextEvent(retries + 1).then(resolve).catch(reject);
        }, 500);
      }

      return resolve(this.consumedEvents.shift());
    });
  }

  produce(event) {
    event.message.guid = String(Math.random());

    return kafkaProducer.produce(event);
  }

  teardown() {
    return this.kafkaConsumer.disconnect();
  }
}

module.exports = ConsumerHelper;
