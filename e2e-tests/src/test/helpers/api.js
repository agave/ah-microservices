const axios = require('axios');

class Api {
  constructor(host = 'http://grpc-gateway', prefix = '/api/') {
    this.client = axios.create({
      baseURL: host + prefix,
      timeout: 1000
    });
  }

  createInvoice(data) {
    return this.client.post('v1/invoice', data);
  }

  getInvoice(data) {
    return this.client.get(`v1/invoice/${data.id}`);
  }

  fundInvoice(data) {
    return this.client.post('v1/invoice/fund', data);
  }

  createUser(data) {
    return this.client.post('v1/users', data);
  }

  getUser(data) {
    return this.client.get(`v1/users/${data.id}`);
  }

  verifyUserBalance(data) {
    return this.client.post('v1/users/verify', data);
  }
}

module.exports = new Api();
