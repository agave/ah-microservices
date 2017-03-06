const grpc = require('grpc');
const server = new grpc.Server();
const port = process.env.PORT || 50051;
// const kafkaProducer = require('./api/vendor/kafka-producer');
// const kafkaConsumer = require('./api/vendor/kafka-consumer');

// Protos
const invoiceProto = grpc.load('/var/lib/core/protos/invoice.proto').invoice;

// Controllers
const Invoice = require('./api/controllers/invoice.js');

function initGRPCServer() {
  server.addProtoService(invoiceProto.Invoice.service, Invoice);
  server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
  server.start();

  console.log(`Listening on port ${port}`);
}

// kafkaProducer
// .connect()
// .then(() => kafkaConsumer.connect(data => console.log('Consumer message', data)))
// .then(() => initGRPCServer())
// .catch(err => {
//   console.log(err);
//   process.exit(1);
// });

initGRPCServer();

module.exports.app = server;
