const kafkaProducer = require('../vendor/kafka-producer');
const ProducerDownError = new Error('Producer is disconnected');

class BaseProducer {
  ensureConnection() {
    return new Promise((resolve, reject) => {
      if (!kafkaProducer.isConnected()) {
        return reject(ProducerDownError);
      }

      return resolve();
    });
  }

  produce(event) {
    return kafkaProducer.produce(event);
  }
}

module.exports = BaseProducer;
