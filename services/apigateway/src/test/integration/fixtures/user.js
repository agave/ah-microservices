const validUser = {
  id: '1',
  email: `user${String(Math.random())}@test.com`,
  balance: 100,
  guid: 'valid user request'
};
const invalidUser = {
  id: '13023',
  guid: 'invalid user request'
};

module.exports = {
  create: {
    validUser
  },
  get: {
    invalidRequest: {
      id: {
        id: invalidUser.id
      }
    },
    validRequest: {
      id: {
        id: validUser.id
      }
    }
  },
  verify: {
    invalidRequest: {
      guid: 'invalid verify request',
      id: invalidUser.id,
      amount: 100
    },
    validRequest: {
      guid: 'valid verify request',
      id: validUser.id,
      amount: validUser.balance / 2
    }
  }
};
