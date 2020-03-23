const { messages } = require('elasticio-node');

const { Client } = require('../client');
const { OneDriveDelete } = require('../utils/deleteUtil');

exports.process = async function (msg, cfg) {
  this.logger.trace('Input message: %j', msg);
  this.logger.trace('Input configuration: %j', cfg);

  const client = new Client(this.logger, cfg);
  const deleteUtils = new OneDriveDelete(this.logger, client);

  try {
    await deleteUtils.deleteObject(msg.body.path);
    return messages.newMessageWithBody({ path: msg.body.path });
  } catch (err) {
    if (err.status === 404) {
      return messages.newEmptyMessage();
    }
    throw err;
  }
};


exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
