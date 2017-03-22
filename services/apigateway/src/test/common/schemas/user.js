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
    balance: {
      required: true,
      type: 'number'
    }
  }
};
