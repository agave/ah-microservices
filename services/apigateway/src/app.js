const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const grpc = require('grpc');
const server = new grpc.Server();
const port = process.env.PORT || 50051;

// Protos
const invoiceProto = grpc.load('/var/lib/core/protos/api/invoice.proto').invoice;
const userProto = grpc.load('/var/lib/core/protos/api/user.proto').user;

// GRPC Controllers
const InvoiceController = require('./api/controllers/invoice');
const UserController = require('./api/controllers/user');

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
  server.addProtoService(userProto.User.service, UserController);
  server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure());
  server.start();

  return waitForServerStart();
}

function shutdown() {
  return Promise.resolve()
  .then(() => server.forceShutdown())
  .then(() => log.message('Shutdown completed', {}, 'App'))
  .catch(err => log.message(err, '', { msg: 'Shutdown error' }));
}

const initPromise = initGRPCServer()
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
  server
};
