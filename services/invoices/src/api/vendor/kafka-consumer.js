const KafkaConsumer = require('/var/lib/core/js/kafka-consumer');
const config = require('../../config').kafkaConsumer;

module.exports = new KafkaConsumer(config);
