const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
const API = require('./helpers/api');
const validate = require('./helpers/validate');
const waitForEvent = require('./helpers/wait-event');

const invoiceFixtures = require('./fixtures/invoice');
const userFixtures = require('./fixtures/user');

const errorSchema = require('./schemas/error');
const invoiceSchema = require('./schemas/invoice');

chai.use(chaiAsPromised);

describe('Invoice tests', function() {

  let createdInvoice;

  describe('createInvoice', () => {
    it('should create an invoice successfully', () => {
      const request = invoiceFixtures.createInvoiceRequest();

      return API.createInvoice(request)
      .should.be.fulfilled
      .then(response => {
        response.status.should.be.equal(200);
        return validate(invoiceSchema)(response.data);
      })
      .then(invoice => {
        createdInvoice = invoice;

        invoice.provider_id.should.be.equal(request.provider_id);
        invoice.amount.should.be.equal(request.amount);
        invoice.status.should.be.equal('new');
        should.not.exist(invoice.investor_id);
      });
    });
  });

  describe('getInvoice', function() {

    it('should return error if invoice does not exists', function() {
      return API.getInvoice(invoiceFixtures.invalidInvoice())
      .should.be.rejected
      .then(err => {
        err.response.status.should.be.equal(500); // TODO: this should actually be 404
        return err.response.data;
      })
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should return invoice', function() {
      return API.getInvoice(createdInvoice)
      .should.be.fulfilled
      .then(response => {
        response.status.should.be.equal(200);
        return validate(invoiceSchema)(response.data);
      })
      .then(validate(invoiceSchema))
      .then(invoice => {
        invoice.should.be.eql(createdInvoice);
      });
    });
  });

  describe('fundInvoice', () => {

    it('should reject if invoice doesn\'t exist', () => {
      return API.fundInvoice(invoiceFixtures.invalidFundInvoiceRequest())
      .should.be.rejected
      .then(err => {
        err.response.status.should.be.equal(500); // TODO: this should actually be 404
        return err.response.data;
      })
      .then(validate(errorSchema('Invoice not found')));
    });

    it('should reject if provider tries to fund his own invoice', () => {
      return API.fundInvoice(invoiceFixtures.sameUserFundInvoiceRequest(createdInvoice.id))
      .should.be.rejected
      .then(err => {
        err.response.status.should.be.equal(500); // TODO: this should actually be 404
        return err.response.data;
      })
      .then(validate(errorSchema('Provider can\'t fund his own invoice')));
    });

    it('should revert invoice status to new if investor doesn\'t have enough money', () => {
      return API.createUser(userFixtures.createUserWithoutMoneyRequest()) // Create provider
      .then(() => API.createUser(userFixtures.createUserWithoutMoneyRequest())) // Create investor
      .then(({ data }) => {
        const request = invoiceFixtures.validFundInvoiceRequest(createdInvoice.id);

        request.investor_id = data.id;

        return API.fundInvoice(request);
      })
      .catch(err => {
        console.log(err);
        throw err;
      })
      .should.be.fulfilled
      .then(({ data }) => data.status.should.be.equal('pending_fund'))
      .then(waitForEvent())
      .then(() => API.getInvoice(createdInvoice))
      .then(({ data }) => data.status.should.be.equal('new'));
    });

    it('should revert invoice status to new if investor doesn\'t exist', () => {
      return API.fundInvoice(invoiceFixtures.invalidUserFundInvoiceRequest(createdInvoice.id))
      .should.be.fulfilled
      .then(({ data }) => data.status.should.be.equal('pending_fund'))
      .then(waitForEvent())
      .then(() => API.getInvoice(createdInvoice))
      .then(({ data }) => data.status.should.be.equal('new'));
    });

    it('should fund an invoice successfully', () => {
      let investor;

      return API.createUser(userFixtures.createUserWithMoneyRequest())
      .then(({ data }) => {
        const request = invoiceFixtures.validFundInvoiceRequest(createdInvoice.id);

        investor = data;
        request.investor_id = data.id;

        return API.fundInvoice(request);
      })
      .should.be.fulfilled
      .then(({ data }) => data.status.should.be.equal('pending_fund'))
      .then(waitForEvent())
      .then(() => API.getInvoice(createdInvoice))
      .then(({ data }) => data.status.should.be.equal('funded'))
      .then(() => API.getUser(investor))
      .then(({ data }) => {
        data.balance.should.be.equal(investor.balance - createdInvoice.amount);
      });
    });
  });
});
