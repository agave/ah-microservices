const chai = require('chai');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const controller = require('../../../api/controllers/user');
const helperFixtures = require('../fixtures/controllers/user');
const uuid = require('uuid');

const { userClient } = require('../../../api/helpers/gateway');

chai.should();
chai.use(require('chai-as-promised'));

describe('unit/User controller', () => {

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
    const { request, createRequestData, createdUser, response } = fixtures;

    it('should reject if userClient.createUser fails', () => {
      const callback = sandbox.spy();
      const createError = new Error('create error');

      sandbox.stub(userClient, 'createUser', () => Promise.reject(createError));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.createUser.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(createError).should.be.true;
      });
    });

    it('should return created user', () => {
      const callback = sandbox.spy();

      sandbox.stub(userClient, 'createUser', () => Promise.resolve(createdUser));

      return controller.create(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.createUser.calledOnce.should.be.true;
        userClient.createUser.calledWith(createRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('get', () => {

    const fixtures = helperFixtures.get;
    const { request, getRequestData, user, response } = fixtures;

    it('should reject if userClient.getUser fails', () => {
      const callback = sandbox.spy();
      const getError = new Error('get error');

      sandbox.stub(userClient, 'getUser', () => Promise.reject(getError));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.getUser.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(getError).should.be.true;
      });
    });

    it('should return user', () => {
      const callback = sandbox.spy();

      sandbox.stub(userClient, 'getUser', () => Promise.resolve(user));

      return controller.get(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.getUser.calledOnce.should.be.true;
        userClient.getUser.calledWith(getRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });

  describe('verify', () => {

    const fixtures = helperFixtures.verify;
    const { request, verifyRequestData, status, response } = fixtures;

    it('should reject if userClient.verifyUserBalance fails', () => {
      const callback = sandbox.spy();
      const getError = new Error('get error');

      sandbox.stub(userClient, 'verifyUserBalance', () => Promise.reject(getError));

      return controller.verify(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.verifyUserBalance.calledOnce.should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(getError).should.be.true;
      });
    });

    it('should return status', () => {
      const callback = sandbox.spy();

      sandbox.stub(userClient, 'verifyUserBalance', () => Promise.resolve(status));

      return controller.verify(request, callback)
      .should.be.fulfilled
      .then(() => {
        uuid.v4.calledOnce.should.be.true;
        userClient.verifyUserBalance.calledOnce.should.be.true;
        userClient.verifyUserBalance.calledWith(verifyRequestData).should.be.true;
        callback.calledOnce.should.be.true;
        callback.calledWith(null, response).should.be.true;
      });
    });
  });
});
