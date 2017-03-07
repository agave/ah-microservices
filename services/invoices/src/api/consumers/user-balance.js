const BaseConsumer = require('./base-consumer');
const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const { Invoice } = require('../../models');
const invoiceProducer = require('../producers/invoice');

class UserConsumer extends BaseConsumer {
  constructor() {
    super('user');
  }

  balanceReserved(event) {
    const { value } = event;
    const { body } = value;
    const query = {
      where: {
        id: body.invoice_id
      }
    };

    log.message('Consuming user event', event, 'Event', value.guid);

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id);
      }

      return invoice.update({ status: 'funded' });
    })
    .then(invoice => invoiceProducer.invoiceFunded(invoice.id, body.user_id))
    .catch(err => {
      log.error(err, value.guid);
      throw err;
    });
  }

  insufficientBalance(event) {
    const { value } = event;
    const { body } = value;
    const query = {
      where: {
        id: body.invoice_id
      }
    };

    log.message('Consuming user event', event, 'Event', value.guid);

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id);
      }

      return invoice.update({ status: 'new' });
    })
    .catch(err => {
      log.error(err, value.guid);
      throw err;
    });
  }

  userNotFound(event) {
    const { value } = event;
    const { body } = value;
    const query = {
      where: {
        id: body.invoice_id
      }
    };

    log.message('Consuming user event', event, 'Event', value.guid);

    return Invoice.findOne(query)
    .then(invoice => {
      if (!invoice) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id);
      }

      return invoice.update({ status: 'new' });
    })
    .catch(err => {
      log.error(err, value.guid);
      throw err;
    });
  }
}

module.exports = new UserConsumer();
