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
    const { body, guid } = value;
    const query = {
      where: {
        id: body.invoice_id,
        status: 'pending_fund'
      }
    };
    let invoice;

    log.message('Consuming user event', event, 'Event', guid);

    return Invoice.findOne(query)
    .then(invoiceInstance => {
      if (!invoiceInstance) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id, guid);
      }
      invoice = invoiceInstance;

      return invoice.update({ status: 'funded' });
    })
    .then(() => {
      if (invoice) {
        return invoiceProducer.invoiceUpdated(invoice.summary(), guid);
      }
      return true;
    })
    .catch(err => {
      log.error(err, guid);
      throw err;
    });
  }

  insufficientBalance(event) {
    const { value } = event;
    const { body, guid } = value;
    const query = {
      where: {
        id: body.invoice_id,
        status: 'pending_fund'
      }
    };
    let invoice;

    log.message('Consuming user event', event, 'Event', guid);

    return Invoice.findOne(query)
    .then(invoiceInstance => {
      if (!invoiceInstance) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id, guid);
      }
      invoice = invoiceInstance;

      return invoice.update({ status: 'new' });
    })
    .then(() => {
      if (invoice) {
        return invoiceProducer.invoiceUpdated(invoice.summary(), guid);
      }
      return true;
    })
    .catch(err => {
      log.error(err, guid);
      throw err;
    });
  }

  funderNotFound(event) {
    const { value } = event;
    const { body, guid } = value;
    const query = {
      where: {
        id: body.invoice_id,
        status: 'pending_fund'
      }
    };
    let invoice;

    log.message('Consuming user event', event, 'Event', guid);

    return Invoice.findOne(query)
    .then(invoiceInstance => {
      if (!invoiceInstance) {
        return invoiceProducer.reservationNotFound(body.invoice_id, body.user_id, guid);
      }
      invoice = invoiceInstance;

      return invoice.update({ status: 'new' });
    })
    .then(() => {
      if (invoice) {
        return invoiceProducer.invoiceUpdated(invoice.summary(), guid);
      }
      return true;
    })
    .catch(err => {
      log.error(err, guid);
      throw err;
    });
  }
}

module.exports = new UserConsumer();
