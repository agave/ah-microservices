class InvoiceFactory {

  createInvoice(id, provider_id, investor_id, status = 'new', amount = 100) {
    return {
      id,
      provider_id,
      investor_id,
      status,
      amount,
      created_at: new Date(),
      updated_at: new Date()
    };
  }
}

module.exports = new InvoiceFactory();
