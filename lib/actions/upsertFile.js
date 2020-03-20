const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { messages } = require('elasticio-node');
const { Client } = require('../client');


exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;

exports.process = async function (msg, cfg) {
  this.logger.info('Merge file action started');
  this.logger.trace('Input message: %j', msg);
  this.logger.trace('Input configuration: %j', cfg);
  const { path } = msg.body;
  if (!msg.attachments) {
    throw new Error(`Error: Attachment not found in message: ${JSON.stringify(msg)}`);
  }
  const attachmentId = Object.keys(msg.attachments)[0];
  const attachment = msg.attachments[attachmentId].url;
  this.logger.trace('About to download attachment from url: %s', attachment);
  const processor = new AttachmentProcessor();
  const content = processor.getAttachment(attachment, 'stream');
  this.logger.trace('Attachment from url: %s downloaded', attachment);
  const client = new Client(this.logger, this.cfg);
  this.logger.trace('Creating file that not exist in path: %s', path);
  const body = await client.uploadFile(path, content);
  this.logger.trace('Successfully created new file in path: %s', path);
  this.logger.trace('Emitting body: %j', body);
  this.logger.info('Merge file action finished');
  return messages.newMessageWithBody({ result: body });
};
