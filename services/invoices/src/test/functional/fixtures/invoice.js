const factory = require('../factories/invoice');

class InvoiceFixtures {
  constructor() {
    this.validInvoiceId = null;
  }

  validInvoice() {
    return factory.createInvoice(this.validInvoiceId, 1);
  }

  fundInvoice() {
    return factory.createInvoice(this.validInvoiceId, 1, 1);
  }
}

module.exports = new InvoiceFixtures();
