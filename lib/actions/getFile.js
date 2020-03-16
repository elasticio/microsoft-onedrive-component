const { messages } = require('elasticio-node');

exports.process = async function (msg, cfg) {
  this.logger.trace('Input message: %j', msg);
  this.logger.trace('Input configuration: %j', cfg);
  await this.emit('data', messages.newMessageWithBody({ data: 'ok' }));
};

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
