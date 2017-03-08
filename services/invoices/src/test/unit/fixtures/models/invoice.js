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
      id: invoice.id,
      provider_id: invoice.provider_id,
      investor_id: invoice.investor_id,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at.toString(),
      updated_at: invoice.updated_at.toString()
    }
  }
};
