module.exports = {
  required: true,
  type: 'object',
  properties: {
    id: {
      required: true,
      type: 'string'
    },
    provider_id: {
      required: true,
      type: 'string'
    },
    investor_id: {
      anyOf: [
        {
          type: 'null'
        },
        {
          type: 'string'
        }
      ]
    },
    amount: {
      required: true,
      type: 'number'
    },
    status: {
      required: true,
      enum: [ 'new', 'pending_fund', 'funded' ]
    },
    created_at: {
      required: true,
      type: 'string'
    },
    updated_at: {
      required: true,
      type: 'string'
    }
  }
};
