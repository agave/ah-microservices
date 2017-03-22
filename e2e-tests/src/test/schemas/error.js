module.exports = function(message) {
  return {
    required: true,
    type: 'object',
    properties: {
      Error: {
        required: true,
        enum: [ message ]
      },
      Code: {
        required: true,
        type: 'number'
      }
    }
  };
};
