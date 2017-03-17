const { userClient } = require('../helpers/gateway');
const LogRequire = require('/var/lib/core/js/log');
const log = new LogRequire(module);
const uuid = require('uuid');

class UserController {
  create({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Create user', request, 'Request', guid);

    return userClient.createUser({
      guid: guid,
      email: request.email,
      balance: request.balance
    })
    .then(user => {
      log.message('Create user', user, 'Response', guid);
      return callback(null, user);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }

  get({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Get user', request, 'Request', guid);

    return userClient.getUser({
      guid: guid,
      id: request.id
    })
    .then(user => {
      log.message('Get user', user, 'Response', guid);
      return callback(null, user);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }

  verify({ request }, callback) {
    const guid = uuid.v4().toString();

    log.message('Verify user', request, 'Request', guid);

    return userClient.verifyUserBalance({
      guid: guid,
      id: request.id,
      amount: request.amount
    })
    .then(user => {
      log.message('Verify user', user, 'Response', guid);
      return callback(null, user);
    })
    .catch((e) => {
      log.error(e, guid);
      return callback(e);
    });
  }
}

module.exports = new UserController();
