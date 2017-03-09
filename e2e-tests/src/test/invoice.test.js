const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const API = require('./helpers/api');
const validate = require('./helpers/validate');
const delay = require('./helpers/promise-delay');

const invoiceFixtures = require('./fixtures/invoice');
const userFixtures = require('./fixtures/user');

const errorSchema = require('./schemas/error');
const invoiceSchema = require('./schemas/invoice');

chai.should();
chai.use(chaiAsPromised);

describe('Invoice tests', function() {

  let createdInvoice;

  describe('createInvoice', () => {
    it('should create an invoice successfully', () => {
      return API.createInvoice(invoiceFixtures.validInvoice())
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => {
        createdInvoice = invoice;
        createdInvoice.should.be.eql(invoiceFixtures.expectedCreatedInvoice());
      });
    });
  });

  describe('getInvoice', function() {

    it('should return error if invoice does not exists', function() {
      return API.getInvoice(invoiceFixtures.invalidInvoice())
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return invoice', function() {
      return API.getInvoice(createdInvoice)
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => {
        invoice.should.be.eql(createdInvoice);
      });
    });
  });

  describe('fundInvoice', () => {

    it('should reject if invoice doesn\'t exist', () => {
      return API.fundInvoice(invoiceFixtures.invalidInvoice())
      .should.be.rejected
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should reject if provider tries to fund his own invoice', () => {
      const fundRequest = {};

      Object.assign(fundRequest, createdInvoice);
      fundRequest.investor_id = createdInvoice.provider_id;

      return API.fundInvoice(fundRequest)
      .should.be.rejected
      .then(validate(errorSchema('Provider can\'t fund his own invoice')));
    });

    it('should reject if investor doesn\'t have enough money', () => {
      const fundRequest = {};

      Object.assign(fundRequest, createdInvoice);
      fundRequest.investor_id = userFixtures.investorWithoutMoney();

      return API.fundInvoice(fundRequest)
      .should.be.rejected
      .then(validate(errorSchema('Investor doesn\'t have enough money')));
    });

    it('should reject if investor doesn\'t exist', () => {
      const fundRequest = {};

      Object.assign(fundRequest, createdInvoice);
      fundRequest.investor_id = userFixtures.invalidInvestor();

      return API.fundInvoice(fundRequest)
      .should.be.rejected
      .then(validate(errorSchema('Investor not found')));
    });

    it('should fund an invoice successfully', () => {
      const fundRequest = {};
      const investor = userFixtures.investorWithMoney();

      Object.assign(fundRequest, createdInvoice);
      fundRequest.investor_id = investor.id;

      return API.fundInvoice(fundRequest)
      .should.be.fulfilled
      .then(validate(invoiceSchema))
      .then(invoice => invoice.should.be.eql(invoiceFixtures.expectedPendingFundInvoice()))
      .then(delay(3000))
      .then(() => API.getInvoice(createdInvoice))
      .then(invoice => invoice.should.be.eql(invoiceFixtures.expectedPendingFundInvoice()))
      .then(() => API.getUser(investor))
      .then(updatedInvestor => {
        updatedInvestor.balance.should.be.equal(investor.balance - createdInvoice.amount);
      });
    });
  });
});
