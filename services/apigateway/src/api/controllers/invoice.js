const { invoiceClient } = require('../helpers/gateway');
const LogRequire = require('/var/lib/core/js/log');
const log = new LogRequire(module);
const uuid = require('uuid');

class InvoiceController {
  create({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Create invoice', request, 'Request', guid);

    return invoiceClient.createInvoice({
      guid: guid,
      provider_id: request.provider_id,
      amount: request.amount
    })
    .then(invoice => {
      log.message('Create invoice', invoice, 'Response', guid);
      return callback(null, invoice);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }

  get({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Get invoice', request, 'Request', guid);

    return invoiceClient.getInvoice({
      guid: guid,
      id: request.id
    })
    .then(invoice => {
      log.message('Get invoice', invoice, 'Response', guid);
      return callback(null, invoice);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }

  fund({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Fund invoice', request, 'Request', guid);

    return invoiceClient.fundInvoice({
      guid: guid,
      investor_id: request.investor_id
    })
    .then(invoice => {
      log.message('Fund invoice', invoice, 'Response', guid);
      return callback(null, invoice);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }
}

module.exports = new InvoiceController();
