const { Invoice } = require('../models');
const data = require('/var/lib/core/database/integration_fixtures/invoices.json');

Invoice.bulkCreate(data);
