const clientFunctions = require('../api/models/invoice.js');
const _ = require('lodash');

const clientOptions = {
  tableName: 'invoices',
  underscored: true
};

module.exports = function(sequelize, DataTypes) {

  const options = _.merge(clientOptions, clientFunctions);
  const Invoice = sequelize.define('Invoice', {
    provider_id: {
      type: DataTypes.INTEGER
    },
    investor_id: {
      type: DataTypes.INTEGER
    },
    amount: {
      type: DataTypes.FLOAT
    },
    status: {
      /* eslint new-cap: ["error", { "properties": false }] */
      type: DataTypes.ENUM('new', 'pending_fund', 'funded')
    },
    created_at: {
      type: DataTypes.DATE
    },
    updated_at: {
      type: DataTypes.DATE
    }
  }, options);

  return Invoice;
};
