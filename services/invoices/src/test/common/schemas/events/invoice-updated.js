const eventSchema = require('./event');
const invoiceSchema = require('../invoice');

const body = invoiceSchema.properties;

module.exports = eventSchema('invoice', 'InvoiceUpdated', body);
