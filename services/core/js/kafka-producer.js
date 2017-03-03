const Kafka = require('/var/lib/app/node_modules/node-rdkafka');

class KafkaProducer {
  constructor(config) {
    this.topicName = config.topic;
    this.producer = new Kafka.Producer(config);

    this.producer.on('error', err => this.errorHandler(err));
    this.producer.on('disconnect', () => console.log('Producer disconnected'));
    this.producer.on('event.log', log => console.log('Producer event', log));
    this.producer.on('delivery-report', report => {
      console.log('delivery-report: ' + JSON.stringify(report));
    });
  }

  connect() {
    this.producer.connect();
    this.producer.on('ready', result => {
      this.ready = true;
      this.topic = this.producer.Topic(this.topicName, { 'request.required.acks': 1 });
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => this.ready ? resolve() : reject('Connection failed'), 1000);
    });
  }

  produce(message, guid) {
    return new Promise((resolve, reject) => {
      try {
        this.producer.produce(
          this.topicName,
          message.id,
          new Buffer(JSON.stringify(message)),
          guid
        );

        return resolve();
      } catch (err) {
        return reject(err);
      }
    });
  }

  errorHandler(err) {
    console.log('Producer error', err);
  }

  disconnect() {
    this.producer.disconnect();
  }
}

module.exports = KafkaProducer;
