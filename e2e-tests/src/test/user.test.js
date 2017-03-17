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
      return API.createUser(userFixtures.validUser())
      .should.be.fulfilled
      .then(validate(userSchema))
      .then(user => {
        createdUser = user;
        createdUser.should.be.eql(userFixtures.expectedCreatedUser());
      });
    });
  });

  describe('getUser', function() {

    it('should return error if user does not exists', function() {
      return API.getUser(userFixtures.invalidUser())
      .should.be.rejected
      .then(validate(errorSchema('User not found')));
    });

    it('should return a user', function() {
      return API.getUser(createdUser)
      .should.be.fulfilled
      .then(validate(userSchema))
      .then(user => {
        user.should.be.eql(createdUser);
      });
    });
  });

  describe('verifyUserBalance', () => {

    it('should reject if user doesn\'t exist', () => {
      return API.verifyUserBalance(userFixtures.invalidUser())
      .should.be.rejected
      .then(validate(errorSchema('User not found')));
    });

    it('should return status', () => {
      return API.verifyUserBalance(createdUser)
      .should.be.fulfilled
      .then(validate(verifyStatusSchema));
    });
  });
});
