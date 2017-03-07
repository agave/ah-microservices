const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const grpc = require('grpc');
const server = new grpc.Server();
const port = process.env.PORT || 50051;
const consumers = require('./api/consumers');
const kafkaProducer = require('./api/vendor/kafka-producer');
const kafkaConsumer = require('./api/vendor/kafka-consumer');

// Protos
const invoiceProto = grpc.load('/var/lib/core/protos/invoice.proto').invoice;

// GRPC Controllers
const InvoiceController = require('./api/controllers/invoice');

function waitForServerStart() {
  return new Promise((resolve) => {
    if (server.started) {
      log.message(`Server listening on port ${port}`, {}, 'App');
      return resolve();
    }

    return setTimeout(() => waitForServerStart().then(resolve), 500);
  });
}

function initGRPCServer() {
  server.addProtoService(invoiceProto.Invoice.service, InvoiceController);
  server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
  server.start();

  return waitForServerStart();
}

function initKafkaProducer() {
  return kafkaProducer.connect()
  .then(() => log.message('Kafka producer connected', {}, 'App'));
}

function initKafkaConsumer() {
  return kafkaConsumer.connect(consumers)
  .then(() => log.message('Kafka consumer connected', {}, 'App'));
}

function shutdown() {
  return Promise.resolve()
  .then(() => kafkaConsumer.disconnect())
  .then(() => server.forceShutdown())
  .then(() => kafkaProducer.disconnect())
  .then(() => log.message('Shutdown completed', {}, 'App'))
  .catch(err => log.message(err, '', { msg: 'Shutdown error' }));
}

const initPromise = Promise.resolve()
.then(() => initKafkaProducer())
.then(() => initKafkaConsumer())
.then(() => initGRPCServer())
.catch(err => {
  log.error(err, '', {
    msg: 'Unable to initialize service'
  });
  /* eslint no-process-exit: 0 */
  shutdown().then(() => process.exit(1));
});

module.exports = {
  initPromise,
  shutdown,
  kafkaProducer,
  kafkaConsumer,
  server
};
