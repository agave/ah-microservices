const guid = 'guid123';

const invoice = {
  id: 1,
  amount: 100,
  provider_id: 1,
  status: 'pending_fund'
};

module.exports = {
  reservationNotFound: {
    invoiceId: invoice.id,
    userId: invoice.provider_id,
    guid,
    event: {
      message: {
        type: 'ReservationNotFound',
        guid,
        body: {
          invoice_id: invoice.id,
          user_id: invoice.provider_id
        }
      },
      key: invoice.id
    }
  },
  invoiceUpdated: {
    invoice,
    guid,
    event: {
      message: {
        type: 'InvoiceUpdated',
        guid,
        body: invoice
      },
      key: invoice.id
    }
  }
};
