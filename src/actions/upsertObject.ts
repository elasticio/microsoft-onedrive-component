import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import { getUserAgent } from '../utils';
import Client from '../OneDriveClient';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Upsert File" action started');
  const { files } = msg.body;
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);
  const attachmentsProcessor = new commons.AttachmentProcessor(getUserAgent(), msg.id);
  if (!Array.isArray(files) || files.length === 0) throw new Error('"Files" must be an array with records');
  const results = [];
  for (const file of files) {
    const { url, path } = file;
    if (!url || !path) throw new Error("URL and path shouldn't be empty");
    const response = await attachmentsProcessor.getAttachment(url, 'stream');
    this.logger.info('File found, download stream created');
    const { uploadUrl } = await client.createUploadSession(path);
    const result = await client.uploadLargeFile(uploadUrl, response);
    results.push(result);
  }

  this.logger.info('"Upsert File" action is done, emitting...');
  return messages.newMessageWithBody(results);
}

export async function getDisks(cfg) {
  client ||= new Client(this, cfg);
  return client.getDisks();
}

module.exports.process = processAction;
module.exports.getDisks = getDisks;
