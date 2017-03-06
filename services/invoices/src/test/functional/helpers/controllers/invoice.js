const { Invoice } = require('../../../../models');
const invoiceFixtures = require('../../fixtures/invoice');

class InvoiceHelper {

  setup() {
    const validInvoice = invoiceFixtures.validInvoice();

    return Invoice.create(validInvoice)
    .then(invoice => {
      invoiceFixtures.validInvoiceId = invoice.dataValues.id;
    });
  }

  teardown() {
    return Invoice.truncate({ cascade: true });
  }
}

module.exports = new InvoiceHelper();
