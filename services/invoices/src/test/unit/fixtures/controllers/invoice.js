const invoice = {
  id: 1,
  provider_id: 1,
  investor_id: null,
  amount: 1000,
  status: 'new',
  created_at: new Date(),
  updated_at: new Date()
};
const summary = {
  id: invoice.id,
  provider_id: invoice.provider_id,
  amount: invoice.amount,
  status: invoice.status,
  created_at: invoice.created_at.toString(),
  updated_at: invoice.updated_at.toString()
};
const investorId = 2;

module.exports = {
  create: {
    request: {
      request: {
        guid: String(Math.random()),
        provider_id: invoice.provider_id,
        amount: invoice.amount
      }
    },
    createInvoiceData: {
      provider_id: invoice.provider_id,
      amount: invoice.amount,
      status: 'new'
    },
    invoiceInstance: {
      dataValues: invoice,
      summary: () => summary
    },
    response: summary
  },
  get: {
    request: {
      request: {
        id: invoice.id,
        guid: String(Math.random())
      }
    },
    findOneData: {
      where: {
        id: invoice.id
      }
    },
    invoiceInstance: {
      dataValues: invoice,
      summary: () => summary
    },
    response: summary
  },
  fund: {
    request: {
      request: {
        id: invoice.id,
        investor_id: investorId,
        guid: String(Math.random())
      }
    },
    ownInvoiceFundRequest: {
      request: {
        id: invoice.id,
        investor_id: invoice.provider_id,
        guid: String(Math.random())
      }
    },
    findOneData: {
      where: {
        id: invoice.id,
        status: 'new'
      }
    },
    updateData: {
      status: 'pending_fund',
      investor_id: investorId
    },
    invoiceInstance: {
      update: () => {
        console.log('Updating invoice');
      },
      summary: () => summary,
      id: 1,
      provider_id: invoice.provider_id,
      investor_id: investorId,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at,
      updated_at: invoice.updated_at
    },
    response: summary
  }
};
