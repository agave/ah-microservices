const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const kafkaProducer = require('../vendor/kafka-producer');

class InvoiceProducer {
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

    return kafkaProducer.produce(event);
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

    return kafkaProducer.produce(event);
  }
}

module.exports = new InvoiceProducer();
