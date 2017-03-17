const grpc = require('/var/lib/app/node_modules/grpc/src/node');
const grpcTypes = [ 'invoice' ];

class Gateway {
  constructor(gatewayHost = 'apigateway:80', protos = grpcTypes) {
    const credentials = grpc.credentials.createInsecure();
    let protoTypes = protos;

    if (typeof protoTypes === 'string') {
      protoTypes = [ protoTypes ];
    }

    protoTypes.forEach((proto) => {
      const load = grpc.load(`/var/lib/core/protos/${proto}.proto`)[proto];
      const uppercase = `${proto.charAt(0).toUpperCase()}${proto.slice(1)}`;

      this[proto] = new load[uppercase](gatewayHost, credentials);
    });
  }

  request(client, method, data) {
    return new Promise((resolve, reject) => {
      const deadline = new Date();

      deadline.setSeconds(deadline.getSeconds() + 2);

      client[method](data, { deadline }, (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve(result);
      });
    });
  }

  createInvoice(req) {
    const data = {
      guid: req.guid,
      provider_id: String(req.provider_id),
      amount: req.amount
    };

    return this.request(this.invoice, 'create', data);
  }

  getInvoice(req) {
    const data = {
      guid: req.guid,
      id: String(req.id)
    };

    return this.request(this.invoice, 'get', data);
  }

  fundInvoice(req) {
    const data = {
      guid: req.guid,
      id: String(req.id),
      investor_id: String(req.investor_id)
    };

    return this.request(this.invoice, 'fund', data);
  }

  createUser(req) {
    const data = {
      guid: req.guid,
      email: req.email,
      balance: req.balance
    };

    return this.request(this.user, 'createUser', data);
  }

  getUser(req) {
    const data = {
      guid: req.guid,
      id: String(req.id)
    };

    return this.request(this.user, 'getUser', data);
  }

  verifyUserBalance(req) {
    const data = {
      guid: req.guid,
      id: String(req.id),
      amount: req.amount
    };

    return this.request(this.user, 'verifyUser', data);
  }
}

module.exports = Gateway;
