const factory = require('../factories/invoice');

class InvoiceFixtures {
  invalidInvoice() {
    return factory.createInvoice(-1, -1, -2);
  }

  validInvoice() {
    return factory.createInvoice(1, 1, 2);
  }
}

module.exports = new InvoiceFixtures();
