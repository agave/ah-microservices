const eventSchema = require('./event');

const body = {
  invoice_id: {
    required: true,
    type: 'number'
  },
  user_id: {
    required: true,
    type: 'number'
  }
};

module.exports = eventSchema('invoice', 'ReservationNotFound', body);
