const validator = require('is-my-json-valid');

function validate(schema) {
  return (value) => {
    const validation = validator(schema);

    validation(value).should.be.eql(true, JSON.stringify(validation.errors));

    return value;
  };
}

module.exports = validate;
