const app = require('../app');

before(() => app.initPromise);

after(() => app.shutdown());
