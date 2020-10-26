const { messages } = require('elasticio-node');
const { Client } = require('../client');

exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;

exports.process = async function process(msg, cfg) {
  this.logger.info('Create folder action started');
  const { path, name } = msg.body;
  const client = new Client(this.logger, cfg);
  const id = await client.isExist(path);
  if (id === false || id === null || id === undefined) {
    this.logger.error('Can\'t create folder in specified path. Path is not exist in drive');
    throw new Error(`Error: Path: "${path}" is not exist in drive: ${cfg.driveId}`);
  }
  const body = await client.createFolder(id, name);
  this.logger.info('Folder is successfully created folder in specified path');
  return messages.newMessageWithBody({ result: body });
};
