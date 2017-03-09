const axios = require('axios');

class Api {
  constructor(host = 'grpc-gateway') {
    this.client = axios.create({
      baseUrl: host,
      timeout: 1000
    });
  }

  createInvoice(data) {
    return this.request('post', 'invoice', data);
  }

  getInvoice(data) {
    return this.request('get', `invoice/${data.id}`);
  }

  fundInvoice(data) {
    return this.request('post', `invoice/${data.id}`, data);
  }
}

module.exports = new Api();
