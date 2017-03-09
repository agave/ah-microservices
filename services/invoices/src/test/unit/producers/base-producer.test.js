const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const BaseProducer = require('../../../api/producers/base-producer');
const helperFixtures = require('../fixtures/producers/base-producer');

const producer = new BaseProducer();
const kafkaProducer = require('../../../api/vendor/kafka-producer');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Base producer', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('ensureConnection', () => {

    it('should reject if kafkaProducer is not connected', () => {
      const connectError = new Error('Producer is disconnected');

      sandbox.stub(kafkaProducer, 'isConnected', () => false);

      return producer.ensureConnection()
      .should.be.rejected
      .then(err => {
        kafkaProducer.isConnected.calledOnce.should.be.true;
        err.should.be.eql(connectError);
      });
    });

    it('should fulfill if kafkaProducer is connected', () => {
      sandbox.stub(kafkaProducer, 'isConnected', () => Promise.resolve());

      return producer.ensureConnection()
      .should.be.fulfilled
      .then(() => {
        kafkaProducer.isConnected.calledOnce.should.be.true;
      });
    });
  });

  describe('produce', () => {

    const fixtures = helperFixtures.produce;
    const { event } = fixtures;

    it('should reject if kafkaProducer.produce fails', () => {
      const produceError = new Error('produce error');

      sandbox.stub(kafkaProducer, 'produce', () => Promise.reject(produceError));

      return producer.produce(event)
      .should.be.rejected
      .then(err => {
        kafkaProducer.produce.calledOnce.should.be.true;
        err.should.be.equal(produceError);
      });
    });

    it('should produce event correctly', () => {
      sandbox.stub(kafkaProducer, 'produce', () => Promise.resolve());

      return producer.produce(event)
      .should.be.fulfilled
      .then(() => {
        kafkaProducer.produce.calledOnce.should.be.true;
        kafkaProducer.produce.calledWith(event).should.be.true;
      });
    });
  });
});
