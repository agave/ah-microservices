const BaseProducer = require('./base-producer');
const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);

class InvoiceProducer extends BaseProducer {
  reservationNotFound(invoiceId, userId, guid) {
    const event = {
      message: {
        type: 'ReservationNotFound',
        guid,
        body: {
          invoice_id: invoiceId,
          user_id: userId
        }
      },
      key: invoiceId
    };

    log.message('Producing invoice event', event, 'Event', guid);

    return this.produce(event);
  }

  invoiceUpdated(invoice, guid) {
    const event = {
      message: {
        type: 'InvoiceUpdated',
        guid,
        body: invoice
      },
      key: invoice.id
    };

    log.message('Producing invoice event', event, 'Event', guid);

    return this.produce(event);
  }

  invoiceCreated(invoice, guid) {
    const event = {
      message: {
        type: 'InvoiceCreated',
        guid,
        body: invoice
      },
      key: invoice.id
    };

    log.message('Producing invoice event', event, 'Event', guid);

    return this.produce(event);
  }
}

module.exports = new InvoiceProducer();
