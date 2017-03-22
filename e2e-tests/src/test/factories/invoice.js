class InvoiceFactory {

  createInvoice(id, provider_id, investor_id, status = 'new', amount = 100) {
    return {
      id,
      provider_id,
      investor_id,
      status,
      amount
    };
  }
}

module.exports = new InvoiceFactory();
