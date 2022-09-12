const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { messages } = require('elasticio-node');
const { Client } = require('../client');
const { getUserAgent } = require('../utils');

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;

exports.process = async function process(msg, cfg) {
  this.logger.info('Upsert file action started');
  const { path } = msg.body;
  if (!msg.attachments) {
    throw new Error('Error: Attachment not found in incoming message');
  }
  const attachmentId = Object.keys(msg.attachments)[0];
  if (!attachmentId) {
    throw new Error('Error: Attachment not found in incoming message');
  }
  const attachment = msg.attachments[attachmentId].url;
  this.logger.debug('About to download attachment...');
  const processor = new AttachmentProcessor(getUserAgent(), msg.id);
  const content = await processor.getAttachment(attachment, 'stream');
  this.logger.debug('Attachment downloaded');
  const client = new Client(this.logger, cfg);
  const body = await client.uploadFile(path, content.data);
  this.logger.info('Upsert file action finished');
  return messages.newMessageWithBody({ result: body });
};
