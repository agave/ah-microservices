const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const { Invoice } = require('../../models');

class InvoiceController {

  _getInvoiceInfo({ dataValues }) {
    const { id, provider_id, investor_id, amount, status, created_at, updated_at } = dataValues;

    const info = {
      id,
      provider_id,
      amount,
      status,
      created_at: created_at.toString(),
      updated_at: updated_at.toString()
    };

    if (investor_id) {
      info.investor_id = investor_id;
    }

    return info;
  }

  create({ request }, callback) {
    const { provider_id, amount } = request;
    const data = { provider_id, amount, status: 'new' };

    log.message('Create invoice', request, 'Request', request.guid);

    return Invoice.create(data)
    .then(invoice => {
      log.message('Create invoice', invoice, 'Response', request.guid);

      return callback(null, this._getInvoiceInfo(invoice));
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

      return callback(null, this._getInvoiceInfo({ dataValues: invoice }));
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

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      log.message('Updating invoice to pending_fund status', invoice, 'Step', request.guid);

      return invoice.update({ status: 'pending_fund', investor_id: request.investor_id });
    })
    .then(invoice => {
      log.message('Fund invoice', invoice, 'Response', request.guid);

      return callback(null, this._getInvoiceInfo(invoice));
    })
    .catch(e => {
      log.error(e, request.guid);

      return callback(e);
    });
  }
}

module.exports = new InvoiceController();
