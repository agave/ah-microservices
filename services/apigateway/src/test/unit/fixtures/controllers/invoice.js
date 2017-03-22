const invoice = {
  id: 1,
  provider_id: 1,
  investor_id: 2,
  amount: 1000,
  status: 'new',
  created_at: (new Date()).toString(),
  updated_at: (new Date()).toString()
};
const guid = String(Math.random());

module.exports = {
  guid,
  create: {
    request: {
      request: {
        provider_id: invoice.provider_id,
        amount: invoice.amount
      }
    },
    createRequestData: {
      guid,
      provider_id: invoice.provider_id,
      amount: invoice.amount
    },
    createdInvoice: invoice,
    response: invoice
  },
  get: {
    request: {
      request: {
        id: invoice.id
      }
    },
    getRequestData: {
      guid,
      id: invoice.id
    },
    invoice,
    response: invoice
  },
  fund: {
    request: {
      request: {
        id: invoice.id,
        investor_id: invoice.investor_id
      }
    },
    fundRequestData: {
      guid,
      id: invoice.id,
      investor_id: invoice.investor_id
    },
    invoice,
    response: invoice
  }
};
