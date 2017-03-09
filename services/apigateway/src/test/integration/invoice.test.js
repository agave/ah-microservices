const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const validate = require('../common/helpers/validate');
const { invoiceClient } = require('../../api/helpers/gateway');

const helperFixtures = require('./fixtures/invoice');

const errorSchema = require('../common/schemas/error');
const invoiceSchema = require('../common/schemas/invoice');

let createdInvoice;

chai.should();
chai.use(chaiAsPromised);

describe('integration/Invoice service', () => {

  describe('createInvoice', () => {

    const fixtures = helperFixtures.create;
    const { validInvoice } = fixtures;

    it('should create an invoice successfully', () => {
      return invoiceClient.createInvoice(validInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => {
        createdInvoice = invoice;
      });
    });
  });

  describe('getInvoice', () => {

    const fixtures = helperFixtures.get;
    const { invalidInvoice } = fixtures;

    it('should reject if invoice doesn\'t exist', () => {
      return invoiceClient.getInvoice(invalidInvoice)
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return an invoice successfully', () => {
      return invoiceClient.getInvoice(createdInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema));
    });
  });

  describe('fundInvoice', () => {

    const fixtures = helperFixtures.fund;
    const { invalidInvoice, investorId } = fixtures;

    it('should reject if invoice doesn\'t exist', () => {
      return invoiceClient.fundInvoice(invalidInvoice)
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return an invoice successfully', () => {
      createdInvoice.investor_id = investorId;

      return invoiceClient.fundInvoice(createdInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema));
    });
  });
});
