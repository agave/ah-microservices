const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const API = require('./helpers/api');
const validate = require('./helpers/validate');

const userFixtures = require('./fixtures/user');

const errorSchema = require('./schemas/error');
const userSchema = require('./schemas/user');
const verifyStatusSchema = require('./schemas/user-verify');

chai.should();
chai.use(chaiAsPromised);

describe('User tests', function() {

  let createdUser;

  describe('createUser', () => {
    it('should create a user successfully', () => {
      const user = userFixtures.createUserWithMoneyRequest();

      return API.createUser(user)
      .should.be.fulfilled
      .then(response => {
        response.status.should.be.equal(200);
        return validate(userSchema)(response.data);
      })
      .then(result => {
        createdUser = result;
        createdUser.email.should.be.equal(user.email);
        createdUser.balance.should.be.equal(user.balance);
      });
    });
  });

  describe('getUser', function() {

    it('should return error if user does not exists', function() {
      return API.getUser(userFixtures.invalidUser())
      .should.be.rejected
      .then(err => {
        err.response.status.should.be.equal(404);
        return err.response.data;
      })
      .then(validate(errorSchema('Not Found')));
    });

    it('should return a user', function() {
      return API.getUser(createdUser)
      .should.be.fulfilled
      .then(response => {
        response.status.should.be.equal(200);
        return validate(userSchema)(response.data);
      })
      .then(user => {
        user.should.be.eql(createdUser);
      });
    });
  });

  describe('verifyUserBalance', () => {

    it('should reject if user doesn\'t exist', () => {
      return API.verifyUserBalance(userFixtures.invalidVerifyUserRequest())
      .should.be.rejected
      .then(err => {
        err.response.status.should.be.equal(404);
        return err.response.data;
      })
      .then(validate(errorSchema('Not Found')));
    });

    it('should return status', () => {
      return API.verifyUserBalance(userFixtures.validVerifyUserRequest(createdUser.id))
      .should.be.fulfilled
      .then(response => {
        response.status.should.be.equal(200);
        return validate(verifyStatusSchema)(response.data);
      });
    });
  });
});
