const env = process.env;
const nodeEnv = env.NODE_ENV || 'development';
let database = env.DB_NAME;
const logging = nodeEnv === 'test' ? false : console.log;

if (nodeEnv === 'test' || nodeEnv === 'development') {
  database = nodeEnv === 'test' ? database + '_test' : database + '_dev';
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
    'group.id': 'invoices-consumer-service',
    'metadata.broker.list': `${env.KAFKA_HOST}:${env.KAFKA_PORT}`,
    'enable.auto.commit': true,
    'event_cb': true,
    topics: ['invoice']
  }
};

module.exports = config;
