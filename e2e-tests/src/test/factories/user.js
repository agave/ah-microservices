class UserFactory {

  createUser(id, email, balance = 100) {
    return {
      id,
      email,
      balance
    };
  }
}

module.exports = new UserFactory();
