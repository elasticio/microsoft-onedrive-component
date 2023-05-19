import { messages } from 'elasticio-node';
import Client from '../OneDriveClient';

let client: Client;
const isDebugFlow = process.env.ELASTICIO_FLOW_TYPE === 'debug';

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Delete File" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);
  const { ifNotFound = 'emitNothing' } = cfg;
  const { path } = msg.body;
  if (!path) throw new Error("Path shouldn't be empty");
  try {
    await client.deleteItem(path);
    this.logger.info('"Delete File" action is done, emitting...');
    await this.emit('data', messages.newMessageWithBody({ path }));
  } catch (err) {
    if (err.response?.status === 404) {
      if (ifNotFound === 'emitNothing') {
        if (isDebugFlow) {
          throw new Error(`No object found. Execution stopped.
          This error is only applicable to the Retrieve Sample.
          In flow executions there will be no error, just an execution skip.`);
        }
        return;
      }
      if (ifNotFound === 'emitEmpty') {
        await this.emit('data', messages.newEmptyMessage());
      } else {
        throw new Error("Can't find file with provided path");
      }
    } else {
      throw err;
    }
  }
}

export async function getDisks(cfg) {
  client ||= new Client(this, cfg);
  return client.getDisks();
}

module.exports.process = processAction;
module.exports.getDisks = getDisks;
