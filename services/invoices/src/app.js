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

function initGRPCServer() {
  server.addProtoService(invoiceProto.Invoice.service, InvoiceController);
  server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
  server.start();

  log.message(`Listening on port ${port}`);
}

function initKafkaProducer() {
  return kafkaProducer.connect();
}

function initKafkaConsumer() {
  return kafkaConsumer.connect(consumers);
}

Promise.resolve()
.then(() => initKafkaProducer())
.then(() => initKafkaConsumer())
.then(() => initGRPCServer())
.catch(err => {
  log.error(err, '', {
    msg: 'Unable to initialize service'
  });
  /* eslint no-process-exit: 0 */
  process.exit(1);
});

module.exports.app = server;
