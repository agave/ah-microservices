const Logger = require('/var/lib/core/js/log');
const log = new Logger(module);
const kafkaProducer = require('../vendor/kafka-producer');

class InvoiceProducer {
  invoiceReserved(invoiceId, amount, userId, guid) {
    const event = {
      message: {
        type: 'InvoiceReserved',
        guid,
        body: {
          invoice_id: invoiceId,
          user_id: userId,
          amount
        }
      },
      key: invoiceId
    };

    log.message('Producing invoice event', event, 'Event', guid);

    return kafkaProducer.produce(event);
  }

  reservationNotFound(invoiceId, userId, guid) {
    const event = {
      message: {
        type: 'reservationNotFound',
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

  invoiceFunded(invoiceId, userId, guid) {
    const event = {
      message: {
        type: 'InvoiceFunded',
        guid,
        body: {
          invoice_id: invoiceId,
          user_id: userId
        }
      },
      key: invoiceId
    };

    log.message('Producing invoice event', event, 'Event', guid);
  }
}

module.exports = new InvoiceProducer();
