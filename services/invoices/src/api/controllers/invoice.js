const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const { Invoice } = require('../../models');
const invoiceProducer = require('../producers/invoice');

class InvoiceController {
  create({ request }, callback) {
    const { provider_id, amount } = request;
    const data = { provider_id, amount, status: 'new' };

    log.message('Create invoice', request, 'Request', request.guid);

    return Invoice.create(data)
    .then(invoice => {
      log.message('Create invoice', invoice, 'Response', request.guid);

      return callback(null, invoice.summary());
    })
    .catch(e => {
      log.error(e, request.guid);
      return callback(e);
    });
  }

  get({ request }, callback) {
    log.message('Get invoice', request, 'Request', request.guid);

    const query = {
      where: {
        id: request.id
      }
    };

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      log.message('Get invoice', invoice, 'Response', request.guid);

      return callback(null, invoice.summary());
    })
    .catch(e => {
      log.error(e, request.guid);

      return callback(e);
    });
  }

  fund({ request }, callback) {
    log.message('Fund invoice', request, 'Request', request.guid);

    const query = {
      where: {
        id: request.id,
        status: 'new'
      }
    };
    const { investor_id, guid } = request;

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        throw new Error('Invoice not found');
      }
      if (invoice.provider_id === investor_id) {
        throw new Error('Owner can\'t fund his own invoice');
      }

      log.message('Updating invoice to pending_fund status', invoice, 'Step', guid);

      return invoice.update({ status: 'pending_fund', investor_id });
    })
    .then(invoice => {
      this.invoice = invoice;

      return invoiceProducer.invoiceReserved(invoice.id, invoice.amount, investor_id, guid);
    })
    .then(() => {
      log.message('Fund invoice', this.invoice, 'Response', guid);

      return callback(null, this.invoice.summary());
    })
    .catch(e => {
      log.error(e, request.guid);

      return callback(e);
    });
  }
}

module.exports = new InvoiceController();
