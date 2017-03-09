const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const consumer = require('../../../api/consumers/user');
const helperFixtures = require('../fixtures/consumers/user');

const { Invoice } = require('../../../models');

const invoiceProducer = require('../../../api/producers/invoice');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/User consumer', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('balanceReserved', () => {

    const fixtures = helperFixtures.balanceReserved;
    const { event, findOneData, invoiceInstance, invoiceSummary, updateData } = fixtures;

    beforeEach(() => {
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceInstance, 'update', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.resolve());
    });

    it('should reject if producer is not connected', () => {
      const connectionError = new Error('connection error');

      invoiceProducer.ensureConnection.restore();
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.reject(connectionError));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.called.should.be.false;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(connectionError);
      });
    });

    it('should reject if Invoice.findOne fails', () => {
      const findOneError = new Error('findOne error');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(findOneError);
      });
    });

    it('should call invoiceProducer.reservationNotFound if invoice is not found', () => {
      const body = event.value.body;

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());

      return consumer.balanceReserved(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledWith(body.invoice_id, body.user_id, event.value.guid).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
      });
    });

    it('should reject if invoiceProducer.reservationNotFound fails', () => {
      const error = 'reservationNotFound error';

      Invoice.findOne.restore();
      invoiceProducer.reservationNotFound.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.reject(error));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceInstance.update fails', () => {
      const error = 'update error';

      invoiceInstance.update.restore();
      sandbox.stub(invoiceInstance, 'update', () => Promise.reject(error));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceProducer.invoiceUpdated fails', () => {
      const error = 'invoiceUpdated error';

      invoiceProducer.invoiceUpdated.restore();
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.reject(error));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        err.should.be.equal(error);
      });
    });

    it('should update invoice and send event', () => {
      return consumer.balanceReserved(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledWith(invoiceSummary, event.value.guid).should.be.true;
      });
    });
  });

  describe('insufficientBalance', () => {

    const fixtures = helperFixtures.insufficientBalance;
    const { event, findOneData, invoiceInstance, invoiceSummary, updateData } = fixtures;

    beforeEach(() => {
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceInstance, 'update', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.resolve());
    });

    it('should reject if producer is not connected', () => {
      const connectionError = new Error('connection error');

      invoiceProducer.ensureConnection.restore();
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.reject(connectionError));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.called.should.be.false;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(connectionError);
      });
    });

    it('should reject if Invoice.findOne fails', () => {
      const findOneError = new Error('findOne error');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return consumer.insufficientBalance(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(findOneError);
      });
    });

    it('should call invoiceProducer.reservationNotFound if invoice is not found', () => {
      const body = event.value.body;

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());

      return consumer.insufficientBalance(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledWith(body.invoice_id, body.user_id, event.value.guid).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
      });
    });

    it('should reject if invoiceProducer.reservationNotFound fails', () => {
      const error = 'reservationNotFound error';

      Invoice.findOne.restore();
      invoiceProducer.reservationNotFound.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.reject(error));

      return consumer.insufficientBalance(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceInstance.update fails', () => {
      const error = 'update error';

      invoiceInstance.update.restore();
      sandbox.stub(invoiceInstance, 'update', () => Promise.reject(error));

      return consumer.insufficientBalance(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceProducer.invoiceUpdated fails', () => {
      const error = 'invoiceUpdated error';

      invoiceProducer.invoiceUpdated.restore();
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.reject(error));

      return consumer.insufficientBalance(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        err.should.be.equal(error);
      });
    });

    it('should update invoice and send event', () => {
      return consumer.insufficientBalance(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledWith(invoiceSummary, event.value.guid).should.be.true;
      });
    });
  });

  describe('funderNotFound', () => {

    const fixtures = helperFixtures.funderNotFound;
    const { event, findOneData, invoiceInstance, invoiceSummary, updateData } = fixtures;

    beforeEach(() => {
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceInstance, 'update', () => Promise.resolve(invoiceInstance));
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.resolve());
    });

    it('should reject if producer is not connected', () => {
      const connectionError = new Error('connection error');

      invoiceProducer.ensureConnection.restore();
      sandbox.stub(invoiceProducer, 'ensureConnection', () => Promise.reject(connectionError));

      return consumer.balanceReserved(event)
      .should.be.rejected
      .then(err => {
        invoiceProducer.ensureConnection.calledOnce.should.be.true;
        Invoice.findOne.called.should.be.false;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(connectionError);
      });
    });

    it('should reject if Invoice.findOne fails', () => {
      const findOneError = new Error('findOne error');

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.reject(findOneError));

      return consumer.funderNotFound(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(findOneError);
      });
    });

    it('should call invoiceProducer.reservationNotFound if invoice is not found', () => {
      const body = event.value.body;

      Invoice.findOne.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());

      return consumer.funderNotFound(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledWith(body.invoice_id, body.user_id, event.value.guid).should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
      });
    });

    it('should reject if invoiceProducer.reservationNotFound fails', () => {
      const error = 'reservationNotFound error';

      Invoice.findOne.restore();
      invoiceProducer.reservationNotFound.restore();
      sandbox.stub(Invoice, 'findOne', () => Promise.resolve());
      sandbox.stub(invoiceProducer, 'reservationNotFound', () => Promise.reject(error));

      return consumer.funderNotFound(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.calledOnce.should.be.true;
        invoiceInstance.update.called.should.be.false;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceInstance.update fails', () => {
      const error = 'update error';

      invoiceInstance.update.restore();
      sandbox.stub(invoiceInstance, 'update', () => Promise.reject(error));

      return consumer.funderNotFound(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.called.should.be.false;
        err.should.be.equal(error);
      });
    });

    it('should reject if invoiceProducer.invoiceUpdated fails', () => {
      const error = 'invoiceUpdated error';

      invoiceProducer.invoiceUpdated.restore();
      sandbox.stub(invoiceProducer, 'invoiceUpdated', () => Promise.reject(error));

      return consumer.funderNotFound(event)
      .should.be.rejected
      .then(err => {
        Invoice.findOne.calledOnce.should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        err.should.be.equal(error);
      });
    });

    it('should update invoice and send event', () => {
      return consumer.funderNotFound(event)
      .should.be.fulfilled
      .then(() => {
        Invoice.findOne.calledOnce.should.be.true;
        Invoice.findOne.calledWith(findOneData).should.be.true;
        invoiceProducer.reservationNotFound.called.should.be.false;
        invoiceInstance.update.calledOnce.should.be.true;
        invoiceInstance.update.calledWith(updateData).should.be.true;
        invoiceProducer.invoiceUpdated.calledOnce.should.be.true;
        invoiceProducer.invoiceUpdated.calledWith(invoiceSummary, event.value.guid).should.be.true;
      });
    });
  });
});
