const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const controller = require('../../../api/controllers/invoice');
const helperFixtures = require('../fixtures/controllers/invoice');

const { Invoice } = require('../../../models');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Invoice controller', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('create', () => {

    const fixtures = helperFixtures.create;
    const { request, createInvoiceData, invoiceInstance, response } = fixtures;

    it('should reject if Invoice.create fails', () => {
      const callback = sandbox.spy();
      const createError = new Error('create error');

      sandbox.stub(Invoice, 'create', () => Promise.reject(createError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.create.calledOnce.should.be.true;
        Invoice.create.calledWith(createInvoiceData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(createError).should.be.true;
      });
    });

    it('should return a successful response', () => {
      const callback = sandbox.spy();

      sandbox.stub(Invoice, 'create', () => Promise.resolve(invoiceInstance));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.create.calledOnce.should.be.true;
        Invoice.create.calledWith(createInvoiceData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('get', () => {

    const fixtures = helperFixtures.get;
    const { request, findOneData, response } = fixtures;

    it('should reject if Invoice.findOne fails', () => {
      const callback = sandbox.spy();
      const findOneError = new Error('findOne error');

      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(findOneError).should.be.true;
      });
    });

    it('should return a successful response', () => {
      const callback = sandbox.spy();

      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(response));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('fund', () => {

    const fixtures = helperFixtures.fund;
    const { request, findOneData, updateData, invoiceInstance, response } = fixtures;

    beforeEach(() => {
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceInstance, 'update', () => Promise.resolve(invoiceInstance));
    });

    it('should reject if Invoice.findOne fails', () => {
      const callback = sandbox.spy();
      const findOneError = new Error('findOne error');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(findOneError).should.be.true;
      });
    });

    it('should reject if invoice.update fails', () => {
      const callback = sandbox.spy();
      const updateError = new Error('update error');

      invoiceInstance.update.restore();
      sandbox.stub(invoiceInstance, 'update', () => Promise.reject(updateError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(updateError).should.be.true;
      });
    });

    it('should update to pending_fund successfully', () => {
      const callback = sandbox.spy();

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });
});
