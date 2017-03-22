const { eventsWaitTime } = require('../../config');

module.exports = function() {
  return function() {
    return new Promise(resolve => setTimeout(resolve, eventsWaitTime));
  };
};
