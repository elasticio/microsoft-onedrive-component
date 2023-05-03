const { messages } = require('elasticio-node');

const { Client } = require('../client');
const { OneDriveLookupFile } = require('../utils/lookupUtil');

exports.process = async function process(msg, cfg) {
  this.logger.info('Get file action started');
  const client = new Client(this.logger, cfg);
  const lookupFile = new OneDriveLookupFile(this.logger, client);
  const result = await lookupFile.lookupObject(msg);
  const message = messages.newMessageWithBody(result);
  this.logger.debug('File successfully found');
  // if (cfg.attachFile) {
  //   this.logger.info('File Attachments option is enabled, saving the file in Maester...');
  //   message.attachmentUrl = {
  //     [result.name]: result.attachment.url
  //   };
  //   delete result.attachment;
  //   this.logger.debug('File successfully saved');
  // }
  this.logger.info('File successfully received');
  return message;
};

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
