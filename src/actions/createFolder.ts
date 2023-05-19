import { messages } from 'elasticio-node';
import Client from '../OneDriveClient';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Create Folder" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);
  const { conflictBehavior = 'fail' } = cfg;
  const { path, name } = msg.body;
  if (!name) throw new Error("Name shouldn't be empty");
  const result = await client.createFolder(path, name, conflictBehavior);

  this.logger.info('"Create Folder" action is done, emitting...');
  return messages.newMessageWithBody(result);
}

export async function getDisks(cfg) {
  client ||= new Client(this, cfg);
  return client.getDisks();
}

module.exports.process = processAction;
module.exports.getDisks = getDisks;
