const { messages } = require('elasticio-node');

const { Client } = require('../client');
const { OneDriveDelete } = require('../utils/deleteUtil');

exports.process = async function process(msg, cfg) {
  this.logger.info('Delete item action started');
  const client = new Client(this.logger, cfg);
  const deleteUtils = new OneDriveDelete(this.logger, client);
  try {
    await deleteUtils.deleteObject(msg.body.path);
    this.logger.info('Item is successfully deleted');
    return messages.newMessageWithBody({ path: msg.body.path });
  } catch (err) {
    if (err.message.includes('itemNotFound')) {
      this.logger.info('Item for deletion is not found');
      return messages.newEmptyMessage();
    }
    throw err;
  }
};

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
