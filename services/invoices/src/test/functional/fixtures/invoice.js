const factory = require('../factories/invoice');

class InvoiceFixtures {
  constructor() {
    this.validInvoiceId = null;
  }

  invalidInvoice() {
    return factory.createInvoice(-1, -1, -2);
  }

  validInvoice() {
    return factory.createInvoice(this.validInvoiceId, 1, 2);
  }
}

module.exports = new InvoiceFixtures();
