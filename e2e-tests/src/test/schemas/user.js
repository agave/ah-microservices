module.exports = {
  required: true,
  type: 'object',
  properties: {
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
