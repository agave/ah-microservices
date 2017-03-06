module.exports = {
  required: true,
  type: 'object',
  properties: {
    id: {
      required: true,
      type: 'integer'
    },
    provider_id: {
      required: true,
      type: 'integer'
    },
    investor_id: {
      type: 'integer'
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
