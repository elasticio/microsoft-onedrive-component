const { messages } = require('elasticio-node');

const { Client } = require('../client');
const { OneDriveLookupFile } = require('../utils/lookupUtil');

exports.process = async function (msg, cfg) {
  this.logger.trace('Input message: %j', msg);
  this.logger.trace('Input configuration: %j', cfg);

  const client = new Client(this.logger, cfg);
  const lookupFile = new OneDriveLookupFile(this.logger, client);
  const result = await lookupFile.lookupObject(msg.body.path);
  const message = messages.newMessageWithBody(result);
  if (cfg.attachFile) {
    message.attachments = {
      [result.name]: result.attachment,
    };
    delete result.attachment;
  }

  return message;
};

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
