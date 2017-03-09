module.exports = {
  required: true,
  type: 'object',
  additionalProperties: false,
  properties: {
    count: {
      required: true,
      type: 'integer'
    },
    id: {
      required: true,
      type: 'string'
    },
    email: {
      required: true,
      type: 'string'
    },
    name: {
      required: true,
      type: 'string'
    },
    role: {
      required: true,
      type: 'string'
    }
  }
};
