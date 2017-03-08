const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const producer = require('../../../api/producers/invoice');
const helperFixtures = require('../fixtures/producers/invoice');

const kafkaProducer = require('../../../api/vendor/kafka-producer');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Invoice producer', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('reservationNotFound', () => {

    const fixtures = helperFixtures.reservationNotFound;
    const { invoiceId, userId, guid, event } = fixtures;

    it('should reject if kafkaProducer.produce fails', () => {
      const produceError = new Error('produce error');

      sandbox.stub(kafkaProducer, 'produce', () => Promise.reject(produceError));

      return producer.reservationNotFound(invoiceId, userId, guid)
      .should.be.rejected
      .then(err => {
        kafkaProducer.produce.calledOnce.should.be.true;
        err.should.be.equal(produceError);
      });
    });

    it('should produce event correctly', () => {
      sandbox.stub(kafkaProducer, 'produce', () => Promise.resolve());

      return producer.reservationNotFound(invoiceId, userId, guid)
      .should.be.fulfilled
      .then(() => {
        kafkaProducer.produce.calledOnce.should.be.true;
        kafkaProducer.produce.calledWithMatch(event).should.be.true;
      });
    });
  });

  describe('invoiceUpdated', () => {

    const fixtures = helperFixtures.invoiceUpdated;
    const { invoice, guid, event } = fixtures;

    it('should reject if kafkaProducer.produce fails', () => {
      const produceError = new Error('produce error');

      sandbox.stub(kafkaProducer, 'produce', () => Promise.reject(produceError));

      return producer.invoiceUpdated(invoice, guid)
      .should.be.rejected
      .then(err => {
        kafkaProducer.produce.calledOnce.should.be.true;
        err.should.be.equal(produceError);
      });
    });

    it('should produce event correctly', () => {
      sandbox.stub(kafkaProducer, 'produce', () => Promise.resolve());

      return producer.invoiceUpdated(invoice, guid)
      .should.be.fulfilled
      .then(() => {
        kafkaProducer.produce.calledOnce.should.be.true;
        kafkaProducer.produce.calledWithMatch(event).should.be.true;
      });
    });
  });

  describe('invoiceCreated', () => {

    const fixtures = helperFixtures.invoiceCreated;
    const { invoice, guid, event } = fixtures;

    it('should reject if kafkaProducer.produce fails', () => {
      const produceError = new Error('produce error');

      sandbox.stub(kafkaProducer, 'produce', () => Promise.reject(produceError));

      return producer.invoiceCreated(invoice, guid)
      .should.be.rejected
      .then(err => {
        kafkaProducer.produce.calledOnce.should.be.true;
        err.should.be.equal(produceError);
      });
    });

    it('should produce event correctly', () => {
      sandbox.stub(kafkaProducer, 'produce', () => Promise.resolve());

      return producer.invoiceCreated(invoice, guid)
      .should.be.fulfilled
      .then(() => {
        kafkaProducer.produce.calledOnce.should.be.true;
        kafkaProducer.produce.calledWithMatch(event).should.be.true;
      });
    });
  });
});
