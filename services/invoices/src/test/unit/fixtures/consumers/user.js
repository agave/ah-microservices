const event = {
  value: {
    guid: '123',
    body: {
      invoice_id: 1,
      user_id: 1
    }
  }
};
const findOneData = {
  where: {
    id: 1,
    status: 'pending_fund'
  }
};
const invoiceInstance = {
  update() {
    console.log('Updating invoice');
  },
  summary() {
    return {
      id: 1,
      status: 'pending_fund',
      amount: 100
    };
  }
};

module.exports = {
  balanceReserved: {
    event: event,
    findOneData: findOneData,
    invoiceInstance: invoiceInstance,
    invoiceSummary: invoiceInstance.summary(),
    updateData: {
      status: 'funded'
    }
  },
  insufficientBalance: {
    event: event,
    findOneData: findOneData,
    invoiceInstance: invoiceInstance,
    invoiceSummary: invoiceInstance.summary(),
    updateData: {
      status: 'new'
    }
  },
  funderNotFound: {
    event: event,
    findOneData: findOneData,
    invoiceInstance: invoiceInstance,
    invoiceSummary: invoiceInstance.summary(),
    updateData: {
      status: 'new'
    }
  }
};
