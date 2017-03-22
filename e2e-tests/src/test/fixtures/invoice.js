const factory = require('../factories/invoice');

class InvoiceFixtures {
  invalidInvoice() {
    return factory.createInvoice('12312', '12312', '12312');
  }

  validInvoice() {
    return factory.createInvoice('1', '1', '2');
  }

  createInvoiceRequest() {
    const invoice = this.validInvoice();

    return {
      provider_id: invoice.provider_id,
      amount: invoice.amount
    };
  }

  invalidFundInvoiceRequest() {
    const invoice = this.invalidInvoice();

    return {
      id: invoice.id,
      investor_id: invoice.investor_id
    };
  }

  sameUserFundInvoiceRequest(invoiceId) {
    const invoice = this.validInvoice();

    return {
      id: invoiceId || invoice.id,
      investor_id: invoice.provider_id
    };
  }

  invalidUserFundInvoiceRequest(invoiceId) {
    const invoice = this.validInvoice();
    const invalidInvoice = this.invalidInvoice();

    return {
      id: invoiceId || invoice.id,
      investor_id: invalidInvoice.investor_id
    };
  }

  validFundInvoiceRequest(invoiceId) {
    const invoice = this.validInvoice();

    return {
      id: invoiceId || invoice.id,
      investor_id: invoice.investor_id
    };
  }
}

module.exports = new InvoiceFixtures();
