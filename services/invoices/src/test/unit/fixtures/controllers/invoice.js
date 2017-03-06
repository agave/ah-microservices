const invoice = {
  id: 1,
  provider_id: 1,
  investor_id: null,
  amount: 1000,
  status: 'new',
  created_at: new Date(),
  updated_at: new Date()
};

module.exports = {
  create: {
    request: {
      request: {
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
      dataValues: invoice
    },
    response: {
      id: invoice.id,
      provider_id: invoice.provider_id,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at.toString(),
      updated_at: invoice.updated_at.toString()
    }
  },
  get: {
    request: {
      request: {
        id: invoice.id
      }
    },
    findOneData: {
      where: {
        id: invoice.id
      }
    },
    response: {
      id: invoice.id,
      provider_id: invoice.provider_id,
      amount: invoice.amount,
      status: invoice.status,
      created_at: invoice.created_at.toString(),
      updated_at: invoice.updated_at.toString()
    }
  },
  fund: {
    request: {
      request: {
        id: invoice.id,
        investor_id: 1
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
      investor_id: 1
    },
    invoiceInstance: {
      update: () => {
        console.log('Updating invoice');
      },
      dataValues: {
        id: 1,
        provider_id: 1,
        investor_id: 1,
        amount: 1000,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date()
      }
    },
    response: {
      id: invoice.id,
      provider_id: invoice.provider_id,
      investor_id: 1,
      amount: invoice.amount,
      status: 'new',
      created_at: invoice.created_at.toString(),
      updated_at: invoice.updated_at.toString()
    }
  }
};
