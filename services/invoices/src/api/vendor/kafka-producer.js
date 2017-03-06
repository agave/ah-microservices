const KafkaProducer = require('/var/lib/core/js/kafka-producer');
const config = require('../../config').kafkaProducer;

module.exports = new KafkaProducer(config);
