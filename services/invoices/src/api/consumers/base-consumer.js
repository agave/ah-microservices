class BaseConsumer {
  constructor(topic) {
    this.topic = topic;
  }

  handle(event) {
    const { type } = event.value;

    if (typeof this[type] === 'function') {
      return this[type](event);
    }

    return Promise.resolve();
  }
}

module.exports = BaseConsumer;
