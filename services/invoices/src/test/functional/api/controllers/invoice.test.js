const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const helper = require('../../helpers/controllers/invoice');
const Gateway = require('../../helpers/gateway');
const validate = require('../../../common/helpers/validate');

const invoiceFixtures = require('../../fixtures/invoice');

const errorSchema = require('../../../common/schemas/error');
const invoiceSchema = require('../../../common/schemas/invoice');
const invoiceUpdatedSchema = require('../../../common/schemas/events/invoice-updated');

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
      return Gateway.fundInvoice({ id: -1 })
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return error if user tries to fund it\'s own invoice', () => {
      const fundInvoice = invoiceFixtures.validInvoice();

      fundInvoice.investor_id = fundInvoice.provider_id;

      return Gateway.fundInvoice(fundInvoice)
      .should.be.rejected
      .then(validate(errorSchema('Provider can\'t fund his own invoice')));
    });

    it('should fund an invoice successfully', () => {
      const fundInvoice = invoiceFixtures.validInvoice();

      return Gateway.fundInvoice(fundInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => {
        invoice.status.should.be.equal('pending_fund');
        invoice.investor_id.should.be.equal(fundInvoice.investor_id);
      })
      .then(() => helper.getNextEvent())
      .then(validate(invoiceUpdatedSchema));
    });
  });
});
