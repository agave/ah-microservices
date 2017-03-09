'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable(
      'invoices',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: true,
          autoIncrement: true
        },
        provider_id: {
          type: Sequelize.INTEGER
        },
        investor_id: {
          type: Sequelize.INTEGER
        },
        status: {
          type: Sequelize.STRING
        },
        amount: {
          type: Sequelize.FLOAT
        },
        created_at: {
          type: Sequelize.DATE
        },
        updated_at: {
          type: Sequelize.DATE
        }
      }
    );
  },

  down: function(queryInterface) {
    return queryInterface.dropTable('invoices');
  }
};
