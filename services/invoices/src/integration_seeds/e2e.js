const { Invoice } = require('../models');
const data = require('/var/lib/core/database/integration_fixtures/invoice.json');

Invoice.bulkCreate(data);
