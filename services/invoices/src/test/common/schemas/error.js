module.exports = function(message) {
  return {
    required: true,
    type: 'object',
    properties: {
      message: {
        required: true,
        enum: [ message ]
      }
    }
  };
};
