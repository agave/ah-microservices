const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const controller = require('../../../api/controllers/invoice');
const helperFixtures = require('../fixtures/controllers/invoice');
const uuid = require('uuid');

const { invoiceClient } = require('../../../api/helpers/gateway');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Invoice controller', () => {

  beforeEach(() => {
    sandbox.stub(uuid, 'v4', () => {
      return {
        toString: function() {
          return helperFixtures.guid;
        }
      };
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('create', () => {

    const fixtures = helperFixtures.create;
    const { request, createRequestData, createdInvoice, response } = fixtures;

    it('should reject if invoiceClient.createInvoice fails', () => {
      const callback = sandbox.spy();
      const createError = new Error('create error');

      sandbox.stub(invoiceClient, 'createInvoice', () => Promise.reject(createError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.createInvoice.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(createError).should.be.true;
      });
    });

    it('should return created invoice', () => {
      const callback = sandbox.spy();

      sandbox.stub(invoiceClient, 'createInvoice', () => Promise.resolve(createdInvoice));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.createInvoice.calledOnce.should.be.true;
        invoiceClient.createInvoice.calledWith(createRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('get', () => {

    const fixtures = helperFixtures.get;
    const { request, getRequestData, invoice, response } = fixtures;

    it('should reject if invoiceClient.getInvoice fails', () => {
      const callback = sandbox.spy();
      const getError = new Error('get error');

      sandbox.stub(invoiceClient, 'getInvoice', () => Promise.reject(getError));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.getInvoice.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(getError).should.be.true;
      });
    });

    it('should return invoice', () => {
      const callback = sandbox.spy();

      sandbox.stub(invoiceClient, 'getInvoice', () => Promise.resolve(invoice));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.getInvoice.calledOnce.should.be.true;
        invoiceClient.getInvoice.calledWith(getRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('fund', () => {

    const fixtures = helperFixtures.fund;
    const { request, fundRequestData, invoice, response } = fixtures;

    it('should reject if invoiceClient.fundInvoice fails', () => {
      const callback = sandbox.spy();
      const getError = new Error('get error');

      sandbox.stub(invoiceClient, 'fundInvoice', () => Promise.reject(getError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.fundInvoice.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(getError).should.be.true;
      });
    });

    it('should return invoice', () => {
      const callback = sandbox.spy();

      sandbox.stub(invoiceClient, 'fundInvoice', () => Promise.resolve(invoice));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        invoiceClient.fundInvoice.calledOnce.should.be.true;
        invoiceClient.fundInvoice.calledWith(fundRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });
});
