const { messages } = require('elasticio-node');
const { Client } = require('../client');

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;

exports.process = async function (msg, cfg) {
  this.logger.info('Create folder action started');
  this.logger.trace('Input message: %j', msg);
  this.logger.trace('Input configuration: %j', cfg);
  const { path, name } = msg.body;
  const client = new Client(this.logger, cfg);
  const id = await client.isExist(path);
  if (id === false || id === null || id === undefined) {
    this.logger.error('Cant create folder in path: %s. Path is not exist in drive: %s', path, cfg.driveId);
    throw new Error(`Error: Path: "${path}" is not exist in drive: ${cfg.driveId}`);
  }
  const body = await client.createFolder(id, name);
  this.logger.trace('Successfully create folder in path: %s', path);
  this.logger.trace('Emitting body: %j', body);
  this.logger.info('Create folder finished');
  return messages.newMessageWithBody({ result: body });
};
