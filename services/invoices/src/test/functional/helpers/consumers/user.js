const { Invoice } = require('../../../../models');
const invoiceFixtures = require('../../fixtures/invoice');

const ConsumerHelper = require('../consumer');

class UserConsumerHelper extends ConsumerHelper {

  constructor() {
    super([ 'invoice' ]);
  }

  setup() {
    const validInvoice = invoiceFixtures.validInvoice();

    return super
    .setup()
    .then(() => Invoice.create(validInvoice))
    .then(invoice => {
      invoiceFixtures.validInvoiceId = invoice.dataValues.id;
    });
  }

  updateInvoice(invoice) {
    const query = {
      where: {
        id: invoice.id
      }
    };

    return Invoice.findOne(query).then(i => i.update({ status: invoice.status }));
  }

  produceBalanceReservedEvent(invoice) {
    const event = {
      topic: 'user',
      message: {
        type: 'BalanceReserved',
        body: {
          invoice_id: invoice.id,
          user_id: invoice.investor_id
        }
      },
      key: invoice.investor_id
    };

    return this.produce(event);
  }

  produceInsufficientBalanceEvent(invoice) {
    const event = {
      topic: 'user',
      message: {
        type: 'InsufficientBalance',
        body: {
          invoice_id: invoice.id,
          user_id: invoice.investor_id
        }
      },
      key: invoice.investor_id
    };

    return this.produce(event);
  }

  produceFunderNotFoundEvent(invoice) {
    const event = {
      topic: 'user',
      message: {
        type: 'FunderNotFound',
        body: {
          invoice_id: invoice.id,
          user_id: invoice.investor_id
        }
      },
      key: invoice.investor_id
    };

    return this.produce(event);
  }

  teardown() {
    return Promise.all([
      Invoice.truncate({ cascade: true }),
      super.teardown()
    ]);
  }
}

module.exports = new UserConsumerHelper();
