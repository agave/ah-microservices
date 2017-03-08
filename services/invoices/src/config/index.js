const env = process.env;
const nodeEnv = env.NODE_ENV || 'development';
const logging = nodeEnv === 'test' ? false : console.log;
let database = env.DB_NAME;
let kafkaConsumerGroup = 'invoices-consumer-service';
let kafkaOffsetReset = 'earliest';

if (nodeEnv === 'test' || nodeEnv === 'development') {
  database = nodeEnv === 'test' ? database + '_test' : database + '_dev';
  // Avoid group restabilization to improve consumer initialization time
  kafkaConsumerGroup = kafkaConsumerGroup + Math.random();
  // Avoid reprocessing messages when running tests
  kafkaOffsetReset = nodeEnv === 'test' ? 'latest' : kafkaOffsetReset;
}

const config = {
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: database,
  host: env.DB_HOST,
  dialect: 'postgres',
  logging: logging,
  seederStorage: 'sequelize',
  kafkaProducer: {
    'client.id': 'invoices-producer-service',
    'metadata.broker.list': `${env.KAFKA_HOST}:${env.KAFKA_PORT}`,
    'compression.codec': 'snappy',
    'retry.backoff.ms': 200,
    'message.send.max.retries': 10,
    'socket.keepalive.enable': true,
    'queue.buffering.max.messages': 100000,
    'queue.buffering.max.ms': 1000,
    'batch.num.messages': 1000000,
    'dr_cb': true,
    'event_cb': true,
    topic: 'invoice'
  },
  kafkaConsumer: {
    'group.id': kafkaConsumerGroup,
    'metadata.broker.list': `${env.KAFKA_HOST}:${env.KAFKA_PORT}`,
    'enable.auto.commit': false,
    'event_cb': true,
    'offsetReset': kafkaOffsetReset,
    topics: [ 'user' ]
  }
};

module.exports = config;
