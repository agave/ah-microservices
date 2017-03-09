module.exports = function(topic, type, bodyProperties) {
  if (!topic || !type || !bodyProperties) {
    throw new Error('Missing event schema properties');
  }

  return {
    required: true,
    type: 'object',
    properties: {
      value: {
        required: true,
        type: 'object',
        properties: {
          type: {
            required: true,
            enum: [ type ]
          },
          guid: {
            required: true,
            type: 'string'
          },
          body: {
            required: true,
            type: 'object',
            properties: bodyProperties,
            additionalProperties: false
          }
        },
        additionalProperties: false
      },
      size: {
        required: true,
        type: 'integer'
      },
      key: {
        required: true,
        type: 'string'
      },
      topic: {
        required: true,
        enum: [ topic ]
      },
      offset: {
        required: true,
        type: 'integer'
      },
      partition: {
        required: true,
        type: 'integer'
      }
    },
    additionalProperties: false
  };
};
