const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const helper = require('./helpers/controllers/invoice');
const Gateway = require('./helpers/gateway');
const validate = require('../common/helpers/validate');

const invoiceFixtures = require('./fixtures/invoice');

const errorSchema = require('../common/schemas/error');
const invoiceSchema = require('../common/schemas/invoice');

chai.should();
chai.use(chaiAsPromised);

describe('functional/Invoice controller', () => {

  before(() => {
    return helper.setup();
  });

  after(() => {
    return helper.teardown();
  });

  afterEach(() => {
    return sandbox.restore();
  });

  describe('create', () => {
    it('should return an invoice successfully', () => {
      return Gateway.createInvoice(invoiceFixtures.validInvoice())
      .should.be.fulfilled
      .then(validate(invoiceSchema));
    });
  });

  describe('get', () => {

    it('should return error if invoice doesn\'t exist', () => {
      return Gateway.getInvoice({ id: 0 })
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return an invoice successfully', () => {
      return Gateway.getInvoice(invoiceFixtures.validInvoice())
      .should.be.fulfilled
      .then(validate(invoiceSchema));
    });
  });

  describe('fund', () => {

    it('should return error if invoice doesn\'t exist', () => {
      return Gateway.fundInvoice({ id: 0 })
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should fund an invoice successfully', () => {
      const fundInvoice = invoiceFixtures.fundInvoice();

      return Gateway.fundInvoice(fundInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => {
        invoice.status.should.be.equal('pending_fund');
        invoice.investor_id.should.be.equal(fundInvoice.investor_id);
      });
    });
  });
});
