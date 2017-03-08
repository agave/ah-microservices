const eventSchema = require('./event');

const body = {
  invoice_id: {
    required: true,
    type: 'integer'
  },
  user_id: {
    required: true,
    type: 'integer'
  }
};

module.exports = eventSchema('invoice', 'ReservationNotFound', body);
