import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import Client from '../OneDriveClient';
import { getUserAgent } from '../utils';
import fileSchema from '../schemas/actions/file.out.json';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Get File" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);
  const { attachFile } = cfg;
  const { path } = msg.body;
  if (!path) throw new Error("Path shouldn't be empty");

  let result;
  try {
    result = await client.getFileMetadata(path);
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error("Can't find file with provided path");
    }
    throw err;
  }

  if (result.folder) throw new Error('Provided path follow to folder, it should be a file');

  if (attachFile) {
    this.logger.info('Going to upload file to platform');
    const attachmentsProcessor = new commons.AttachmentProcessor(getUserAgent(), msg.id);
    const getAttachment = async () => client.downloadFile(path);
    const attachmentId = await attachmentsProcessor.uploadAttachment(getAttachment);
    const attachmentUrl = attachmentsProcessor.getMaesterAttachmentUrlById(attachmentId);
    result.attachmentUrl = attachmentUrl;
  }

  this.logger.info('"Get File" action is done, emitting...');
  return messages.newMessageWithBody(result);
}

export async function getMetaModel(cfg) {
  const out: any = fileSchema;
  if (cfg.attachFile) out.properties.attachmentUrl = { type: 'string' };
  const meta = {
    in: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          required: true,
          title: 'Path',
          help: {
            description: 'Full path to item, ex: `Monthly reports/November/Cars sales.pdf`'
          }
        },
      },
    },
    out,
  };
  return meta;
}

export async function getDisks(cfg) {
  client ||= new Client(this, cfg);
  return client.getDisks();
}

module.exports.process = processAction;
module.exports.getDisks = getDisks;
module.exports.getMetaModel = getMetaModel;
