const axios = require('axios');

class Api {
  constructor(host = 'grpc-gateway', prefix = '/api/') {
    this.client = axios.create({
      baseUrl: host + prefix,
      timeout: 1000
    });
  }

  createInvoice(data) {
    return this.request('post', 'v1/invoice', data);
  }

  getInvoice(data) {
    return this.request('get', `v1/invoice/${data.id}`);
  }

  fundInvoice(data) {
    return this.request('post', 'v1/invoice/fund', data);
  }

  createUser(data) {
    return this.request('post', 'v1/users', data);
  }

  getUser(data) {
    return this.request('get', `v1/users/${data.id}`);
  }

  verifyUserBalance(data) {
    return this.request('post', 'v1/user/verify', data);
  }
}

module.exports = new Api();
