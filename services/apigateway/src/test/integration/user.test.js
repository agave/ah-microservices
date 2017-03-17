const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const validate = require('../common/helpers/validate');
const { userClient } = require('../../api/helpers/gateway');

const helperFixtures = require('./fixtures/user');

const errorSchema = require('../common/schemas/error');
const userSchema = require('../common/schemas/user');
const verifyStatusSchema = require('../common/schemas/user-verify-status');

let createdUser;

chai.should();
chai.use(chaiAsPromised);

describe('integration/User service', () => {

  describe('createUser', () => {

    const fixtures = helperFixtures.create;
    const { validUser } = fixtures;

    it('should create an user successfully', () => {
      return userClient.createUser(validUser)
      .should.be.fulfilled
      .then(validate(userSchema))
      .then(user => {
        createdUser = user;
      });
    });
  });

  describe('getUser', () => {

    const fixtures = helperFixtures.get;
    const { invalidRequest, validRequest } = fixtures;

    it('should reject if user doesn\'t exist', () => {
      return userClient.getUser(invalidRequest)
      .should.be.rejected
      .then(validate(errorSchema('Not Found')));
    });

    it('should return an user successfully', () => {
      const request = {};

      Object.assign(request, validRequest);
      request.guid = 'valid get request';
      request.id = createdUser.id;

      return userClient.getUser(request)
      .should.be.fulfilled
      .then(validate(userSchema));
    });
  });

  describe('verify', () => {

    const fixtures = helperFixtures.verify;
    const { invalidRequest, validRequest } = fixtures;

    it('should respond with false status if user doesn\'t exist', () => {
      return userClient.verifyUserBalance(invalidRequest)
      .should.be.rejected
      .then(validate(errorSchema('Not Found')));
    });

    it('should return a status successfully', () => {
      const request = {};

      Object.assign(request, validRequest);
      request.id = createdUser.id;

      return userClient.verifyUserBalance(validRequest)
      .should.be.fulfilled
      .then(validate(verifyStatusSchema))
      .then(result => {
        result.canUserFund.should.be.true;
      });
    });
  });
});
