/* eslint-disable no-loop-func, max-len */
import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import Client from '../OneDriveClient';
import { getUserAgent, removeSubfolders } from '../utils';
import fileSchema from '../schemas/actions/file.out.json';

let client: Client;
const isDebugFlow = process.env.ELASTICIO_FLOW_TYPE === 'debug';
const maxPageSize = isDebugFlow ? 10 : 999;

const timestamp = (date) => new Date(date).getTime();
const isDateValid = (date) => new Date(date).toString() !== 'Invalid Date';
const isNumberNaN = (num) => Number(num).toString() === 'NaN';
const timeToString = (date) => JSON.stringify(new Date(date)).replace(/"/g, '');

export async function processTrigger(msg, cfg, snapshot) {
  this.logger.info('"Get New and Updated Objects" trigger started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const currentTime = new Date();
  const {
    emitBehavior = 'emitIndividually',
    startTime,
    endTime,
    pollConfig = 'lastModifiedDateTime',
    attachFile,
    includeSubfolders,
  } = cfg;
  let { pageSize = maxPageSize, path } = cfg;
  if (includeSubfolders) path = removeSubfolders(path);
  if (!pageSize) pageSize = maxPageSize;
  const attachmentsProcessor = new commons.AttachmentProcessor(getUserAgent(), msg.id);

  if (!path || path.length === 0) throw new Error('Select at least one folder to follow');
  if (startTime && !isDateValid(startTime)) throw new Error('invalid "Start Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
  if (endTime && !isDateValid(endTime)) throw new Error('invalid "End Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
  if (isNumberNaN(pageSize) || Number(pageSize) <= 0 || Number(pageSize) > 999) throw new Error('"Size of Polling Page" must be valid number between 1 and 999');
  if (startTime && endTime && startTime > endTime) throw new Error('"Start Time" should be less or equal to "End Time"');

  const from = snapshot?.nextStartTime || startTime || 0;
  const to = timestamp(endTime || currentTime) > timestamp(currentTime) ? currentTime : endTime || currentTime;

  if (timestamp(from) > timestamp(to)) throw new Error('Flow reached "End Time". No data can be found for the selected dates');

  this.logger.info(`Will collect files where ${pollConfig} between ${timeToString(from)} and ${timeToString(to)} fetching ${pageSize} records per call from ${path.length} folders${includeSubfolders ? ' including all subfolders' : ''}`);

  let emitted;
  const arrayOfFoldersProcessor = async (paths) => {
    for (const folder of paths) {
      this.logger.info(`Start processing "${folder}" path`);
      const subFolders = await subFolderCollectorAndFileEmitter(folder);
      if (includeSubfolders) await arrayOfFoldersProcessor(subFolders);
    }
  };

  const subFolderCollectorAndFileEmitter = async (folderPath) => {
    let nextLink;
    const allSubFolders = [];
    let iteration = 1;
    do {
      const folderContent = await client.getChildren(folderPath, nextLink, pageSize);
      nextLink = folderContent['@odata.nextLink'];
      const files = folderContent.value
        .filter((file) => file.file)
        .filter((file) => (timestamp(file[pollConfig]) >= timestamp(from)) && timestamp(file[pollConfig]) < timestamp(to));
      const subFolders = folderContent.value
        .filter((subFolder) => subFolder.folder?.childCount > 0);

      this.logger.info(`Polling iteration ${iteration} - total ${folderContent.value.length} items found in folder, ${files.length} files mach and ${subFolders.length} non empty subfolders found`);
      iteration++;
      if (files.length > 0) {
        await fileEmitter(files, folderPath);
        emitted = true;
      }
      allSubFolders.push(...subFolders.map((subFolder) => `${folderPath}/${subFolder.name}`));
    } while (isDebugFlow ? false : nextLink);
    return allSubFolders;
  };

  const fileEmitter = async (files, folderPath) => {
    for (const file of files) {
      if (attachFile) {
        const getAttachment = async () => client.downloadFile(`${folderPath}/${file.name}`);
        const attachmentId = await attachmentsProcessor.uploadAttachment(getAttachment);
        const attachmentUrl = attachmentsProcessor.getMaesterAttachmentUrlById(attachmentId);
        file.attachmentUrl = attachmentUrl;
      }
      if (emitBehavior === 'emitIndividually') await this.emit('data', messages.newMessageWithBody(file));
    }
    if (emitBehavior === 'emitPage') {
      await this.emit('data', messages.newMessageWithBody({ results: files }));
    }
  };

  await arrayOfFoldersProcessor(path);
  if (isDebugFlow && !emitted) {
    throw new Error(`No object found. Execution stopped.
    This error is only applicable to the Retrieve Sample.
    In flow executions there will be no error, just an execution skip.`);
  }
  await this.emit('snapshot', { nextStartTime: currentTime });
  this.logger.info('Processing Polling trigger finished successfully');
}

export async function getMetaModel(cfg) {
  const { emitBehavior = 'emitIndividually', attachFile } = cfg;
  const fileOut: any = fileSchema;
  if (attachFile) fileOut.properties.attachmentUrl = { type: 'string' };
  const meta: any = {
    in: {},
    out: {},
  };
  if (emitBehavior === 'emitIndividually') {
    meta.out = fileOut;
  } else {
    meta.out = {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: fileOut
        }
      }
    };
  }
  return meta;
}

export async function getDisks(cfg) {
  client ||= new Client(this, cfg);
  return client.getDisks();
}

export async function getFolderPaths(cfg) {
  client = new Client(this, cfg);
  return client.getFolderPaths();
}

module.exports.process = processTrigger;
module.exports.getDisks = getDisks;
module.exports.getFolderPaths = getFolderPaths;
module.exports.getMetaModel = getMetaModel;
