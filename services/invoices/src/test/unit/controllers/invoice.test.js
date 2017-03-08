const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const controller = require('../../../api/controllers/invoice');
const helperFixtures = require('../fixtures/controllers/invoice');

const { Invoice } = require('../../../models');

const invoiceProducer = require('../../../api/producers/invoice');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Invoice controller', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('create', () => {

    const fixtures = helperFixtures.create;
    const { request, createInvoiceData, invoiceInstance, response } = fixtures;

    beforeEach(() => {
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'invoiceCreated', () => Promise.resolve());
      sandbox.stub(Invoice, 'create', () => Promise.resolve(invoiceInstance));
    });

    it('should reject if producer is not connected', () => {
      const callback = sandbox.spy();
      const connectionError = new Error('connection error');

      invoiceProducer.ensureConnection.restore();
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.reject(connectionError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.create.called.should.be.false;
        invoiceProducer.invoiceCreated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(connectionError).should.be.true;
      });
    });

    it('should reject if Invoice.create fails', () => {
      const callback = sandbox.spy();
      const createError = new Error('create error');

      Invoice.create.restore();
      sandbox.stub(Invoice, 'create', () => Promise.reject(createError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.create.calledOnce.should.be.true;
        invoiceProducer.invoiceCreated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(createError).should.be.true;
      });
    });

    it('should reject if invoiceProducer.created fails', () => {
      const callback = sandbox.spy();
      const produceError = new Error('produce error');

      invoiceProducer.invoiceCreated.restore();
      sandbox.stub(invoiceProducer, 'invoiceCreated', () => Promise.reject(produceError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.create.calledOnce.should.be.true;
        invoiceProducer.invoiceCreated.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(produceError).should.be.true;
      });
    });

    it('should return a successful response', () => {
      const callback = sandbox.spy();

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.create.calledOnce.should.be.true;
        Invoice.create.calledWith(createInvoiceData).should.be.true;
        invoiceProducer.invoiceCreated.calledOnce.should.be.true;
        invoiceProducer.invoiceCreated.calledWith(response, request.request.guid).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('get', () => {

    const fixtures = helperFixtures.get;
    const { request, findOneData, invoiceInstance, response } = fixtures;

    it('should reject if Invoice.findOne fails', () => {
      const callback = sandbox.spy();
      const findOneError = new Error('findOne error');

      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(findOneError).should.be.true;
      });
    });

    it('should reject if invoice doesn\'t exist', () => {
      const callback = sandbox.spy();
      const error = new Error('Invoice not found');

      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWithMatch(error).should.be.true;
      });
    });

    it('should return a successful response', () => {
      const callback = sandbox.spy();

      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));

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
    const { request, ownInvoiceFundRequest, findOneData, updateData, invoiceInstance, response } = fixtures;

    beforeEach(() => {
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceInstance, 'update', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.resolve());
    });

    it('should reject if producer is not connected', () => {
      const callback = sandbox.spy();
      const connectionError = new Error('connection error');

      invoiceProducer.ensureConnection.restore();
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.reject(connectionError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(connectionError).should.be.true;
      });
    });

    it('should reject if Invoice.findOne fails', () => {
      const callback = sandbox.spy();
      const findOneError = new Error('findOne error');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(findOneError).should.be.true;
      });
    });

    it('should reject if invoice doesn\'t exist', () => {
      const callback = sandbox.spy();
      const error = new Error('Invoice not found');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(error).should.be.true;
      });
    });

    it('should reject if provider tries to fund his own invoice', () => {
      const callback = sandbox.spy();
      const error = new Error('Provider can\'t fund his own invoice');

      return controller.fund(ownInvoiceFundRequest, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWithMatch(error).should.be.true;
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
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        callback.calledOnce.should.be.true;
        callback.calledWith(updateError).should.be.true;
      });
    });

    it('should reject if invoiceProducer.invoiceUpdated fails', () => {
      const callback = sandbox.spy();
      const produceError = new Error('produce error');

      invoiceProducer.invoiceUpdated.restore();
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.reject(produceError));

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(produceError).should.be.true;
      });
    });

    it('should update to pending_fund successfully', () => {
      const callback = sandbox.spy();

      return controller.fund(request, callback)
      .should.be.fulfilled
      .then(() => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.calledOnce.should.be.true;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledWith(response, request.request.guid).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });
});
