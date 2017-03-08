const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const model = require('../../../api/models/invoice');
const helperFixtures = require('../fixtures/models/invoice');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/Invoice model', () => {

  afterEach(() => {
    sandbox.restore();
  });

  describe('summary', () => {

    const fixtures = helperFixtures.summary;
    const { invoice, summary } = fixtures;
    let modelInstance = {
      instanceMethods: {}
    };
    let instanceSummary;

    beforeEach(() => {
      modelInstance = {};
      instanceSummary = {};
      Object.assign(modelInstance, model);
      Object.assign(modelInstance.instanceMethods, invoice);
      Object.assign(instanceSummary, summary);
    });

    it('should return summary without investor_id if it is null', done => {
      delete modelInstance.instanceMethods.investor_id;
      delete instanceSummary.investor_id;

      try {
        instanceSummary.should.be.eql(modelInstance.instanceMethods.summary());
        done();
      } catch (err) {
        done(err);
      }
    });

    it('should return summary with investor_id if its exists', done => {
      try {
        instanceSummary.should.be.eql(modelInstance.instanceMethods.summary());
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
