const providerId = 1;
const investorId = 2;
const invalidInvoice = {
  id: -1
};

module.exports = {
  create: {
    validInvoice: {
      provider_id: providerId,
      amount: 100
    }
  },
  get: {
    invalidInvoice
  },
  fund: {
    invalidInvoice,
    investorId
  }
};
