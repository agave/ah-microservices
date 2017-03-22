const factory = require('../factories/user');

class UserFixtures {
  invalidUser() {
    return factory.createUser('1231231', 'invalid@user.com', 0);
  }

  validUser() {
    return factory.createUser('1', `valid${Date.now()}@user.com`, 1000);
  }

  createUserWithoutMoneyRequest() {
    const user = this.validUser();

    return {
      email: user.email,
      balance: 0
    };
  }

  createUserWithMoneyRequest() {
    const user = this.validUser();

    return {
      email: user.email,
      balance: 100000
    };
  }

  invalidVerifyUserRequest() {
    const user = this.invalidUser();

    return {
      id: user.id,
      amount: 100000
    };
  }

  validVerifyUserRequest(userId) {
    const user = this.validUser();

    return {
      id: userId || user.id,
      amount: 10
    };
  }
}

module.exports = new UserFixtures();
