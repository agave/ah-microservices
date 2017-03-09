const ConsumerHelper = require('../consumer');
const { Invoice } = require('../../../../models');
const invoiceFixtures = require('../../fixtures/invoice');

class InvoiceHelper extends ConsumerHelper {

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

  teardown() {
    return Promise.all([
      Invoice.truncate({ cascade: true }),
      super.teardown()
    ]);
  }
}

module.exports = new InvoiceHelper();
