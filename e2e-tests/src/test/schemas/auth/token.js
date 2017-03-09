module.exports = {
  required: true,
  type: 'object',
  properties: {
    value: {
      required: true,
      type: 'string'
    },
    expiration: {
      required: true,
      type: 'integer'
    }
  }
};
