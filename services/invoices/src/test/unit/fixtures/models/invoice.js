const invoice = {
  id: 1,
  provider_id: 1,
  investor_id: 2,
  amount: 100,
  status: 'new',
  created_at: new Date(),
  updated_at: new Date()
};

module.exports = {
  summary: {
    invoice,
    summary: {
      id: String(invoice.id),
      provider_id: String(invoice.provider_id),
      investor_id: String(invoice.investor_id),
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at.toString(),
      updated_at: invoice.updated_at.toString()
    }
  }
};
