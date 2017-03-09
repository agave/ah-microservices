const Kafka = require('/var/lib/app/node_modules/node-rdkafka');

class KafkaConsumer {
  constructor(config) {
    this.config = config;
    this.consumer = new Kafka.KafkaConsumer({
      'group.id': config['group.id'],
      'metadata.broker.list': config['metadata.broker.list']
    });

    this.consumer.on('disconnect', () => console.log('Producer disconnected'));
    this.consumer.on('error', err => this.errorHandler(err));
    this.consumer.on('event.log', log => console.log('Consumer event', log));
  }

  connect(onMessageReceived) {
    this.consumer
    .on('ready', () => {
      this.ready = true;
      this.consumer.subscribe(this.config.topics);
      this.consumer.consume();
    })
    .on('data', data => {
      onMessageReceived(data);
    });
    this.consumer.connect();

    return new Promise((resolve, reject) => {
      setTimeout(() => this.ready ? resolve() : reject('Connection failed'), 1000);
    });
  }

  errorHandler(err) {
    console.log('Consumer error', err);
  }

  disconnect() {
    this.consumer.disconnect();
  }
}

module.exports = KafkaConsumer;
