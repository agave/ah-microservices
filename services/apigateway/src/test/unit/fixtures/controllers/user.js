const user = {
  id: 1,
  email: 'user@test.com',
  balance: 100
};
const guid = String(Math.random());

module.exports = {
  guid,
  create: {
    request: {
      request: {
        email: user.email,
        balance: user.balance
      }
    },
    createRequestData: {
      guid,
      email: user.email,
      balance: user.balance
    },
    createdUser: user,
    response: user
  },
  get: {
    request: {
      request: {
        id: user.id
      }
    },
    getRequestData: {
      guid,
      id: user.id
    },
    user,
    response: user
  },
  verify: {
    request: {
      request: {
        id: user.id,
        amount: 100
      }
    },
    verifyRequestData: {
      guid,
      id: user.id,
      amount: 100
    },
    status: {
      canUserFund: true
    },
    response: {
      canUserFund: true
    }
  }
};
