const fs = require('fs');
const path = require('path');
const basename = path.basename(module.filename);

const handlers = {};

fs
.readdirSync(__dirname)
.filter(file => {
  return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
})
.forEach(file => {
  const handler = require(`./${file}`);

  if (handler.topic) {
    handlers[handler.topic] = handler;
  }
});

function handle(event) {
  const handler = handlers[event.topic];

  // Camelize event type which should match a handler's function
  event.value.type = event.value.type.substr(0, 1).toLowerCase() + event.value.type.substr(1);

  if (handler) {
    return handler.handle(event);
  }

  return Promise.reject(new Error(`No handler found for topic ${event.topic}`));
}

module.exports.handle = handle;
