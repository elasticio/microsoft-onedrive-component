/* eslint-disable no-param-reassign */
const {
  MIN_DATE, MAX_DATE, EMIT_INDIVIDUALLY, FETCH_ALL,
} = require('@elastic.io/oih-standard-library/lib/constants');
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { PollingTrigger } = require('@elastic.io/oih-standard-library/lib/triggers/getNewAndUpdated');
const { messages } = require('elasticio-node');
const { Client } = require('../client');

class OneDrivePollingTrigger extends PollingTrigger {
  constructor(logger, emitter, client) {
    super(logger, emitter);
    this.client = client;
    this.attachmentsProcessor = new AttachmentProcessor();
  }

  async getChildesFiles(items, startTime, endTime, files, filterOperator) {
    const folders = items.filter((item) => Object.prototype.hasOwnProperty.call(item, 'folder'));
    await Promise.all(folders.map(async (folder) => {
      const result = await this.getObjects(folder.id, startTime, endTime, filterOperator);
      const childesFiles = result.filter((item) => !Object.prototype.hasOwnProperty.call(item, 'folder'));
      files.push(...childesFiles);
      await this.getChildesFiles(result, startTime, endTime, files, filterOperator);
    }));
  }

  async emitAll(resultFiles) {
    const message = messages.newMessageWithBody({ results: resultFiles });
    await Promise.all(resultFiles.map(async (file) => {
      if (this.client.cfg.attachFile) {
        const attachment = await this.client.downloadFileByItemId(file.id);
        const attachmentResult = await this.attachmentsProcessor.uploadAttachment(attachment);
        message.attachments[file.name] = {
          url: attachmentResult.config.url,
          size: file.size,
          'content-type': file.file.mimeType,

        };
      }
    }));
    this.logger.trace('Emitting new message with body: %j', message);
    await this.context.emit('data', message);
    this.logger.debug('Finished emitting data');
  }

  async emitIndividually(resultFiles) {
    await Promise.all(resultFiles.map(async (file) => {
      const message = messages.newMessageWithBody(file);
      if (this.client.cfg.attachFile) {
        const attachment = await this.client.downloadFileByItemId(file.id);
        const attachmentResult = await this.attachmentsProcessor.uploadAttachment(attachment);
        message.attachments = {
          [file.name]: {
            url: attachmentResult.config.url,
            size: file.size,
            'content-type': file.file.mimeType,
          },
        };
      }
      this.logger.trace('Emitting new message with body: %j', message);
      await this.context.emit('data', message);
      this.logger.debug('Finished emitting data');
    }));
  }

  async getObjects(itemId, startTime, endTime, filterOperator) {
    let startTimeParam = '';
    let endTimeParam = '';
    if (startTime && Date.parse(startTime) && Date.parse(startTime) !== MIN_DATE) {
      startTimeParam = `&$filter=lastModifiedDateTime ${filterOperator || 'ge'} ${startTime}`;
    }
    if (endTime && Date.parse(endTime) && Date.parse(endTime) !== MAX_DATE) {
      endTimeParam = startTimeParam ? `${startTimeParam} and lastModifiedDateTime lt ${endTime}` : `&$filter=lastModifiedDateTime lt ${endTime}`;
    }
    const params = `?$orderby=lastModifiedDateTime${startTimeParam}${endTimeParam}`;
    return this.client.getChildren(itemId, params);
  }

  async process(cfg, snapshot) {
    try {
      this.logger.info('Starting processing Polling trigger');
      this.logger.trace('Incoming configuration: %j', cfg);
      this.logger.trace('Incoming snapshot: %j', snapshot);
      const { itemId, expandChildren } = cfg;
      const startTime = this.getStartTime(cfg, snapshot);
      const endTime = this.getEndTime(cfg);
      const pageSize = this.getSizeOfPollingPage(cfg);
      this.logger.debug('Start object polling');
      const allObjects = await this.getObjects(itemId, startTime, endTime, snapshot.filterOperator);
      this.logger.debug('Finish object polling');
      this.logger.trace('Polled objects: %j', allObjects);
      if (allObjects === undefined || allObjects === null || allObjects.length === 0) {
        this.logger.debug('No new or updated objects was found');
        return;
      }
      const files = allObjects.filter((item) => !Object.prototype.hasOwnProperty.call(item, 'folder'));
      if (expandChildren) {
        await this.getChildesFiles(allObjects, startTime, endTime, files, snapshot.filterOperator);
      }
      if (files.length === 0) {
        this.logger.debug('No new or updated files was found');
        return;
      }
      files.sort((a, b) => (a.lastModifiedDateTime > b.lastModifiedDateTime ? 1 : -1));
      let resultFiles;
      if (files.length > pageSize) {
        const newStartTime = files[pageSize].lastModifiedDateTime;
        resultFiles = files.filter((file) => file.lastModifiedDateTime < newStartTime);
        snapshot.startTime = newStartTime;
      } else {
        resultFiles = files;
        snapshot.startTime = files[files.length - 1].lastModifiedDateTime;
        snapshot.filterOperator = 'gt';
      }
      const emitBehaviour = this.getEmitBehaviour(cfg);
      if (emitBehaviour === EMIT_INDIVIDUALLY) {
        this.emitIndividually(resultFiles);
      } else if (emitBehaviour === FETCH_ALL) {
        this.emitAll(resultFiles);
      }
      this.logger.debug('Start emitting snapshot');
      this.logger.trace('Snapshot to be emitted: %j', snapshot);
      this.context.emit('snapshot', snapshot);
      this.logger.debug('Finish emitting snapshot');
      this.logger.info('Finished processing call to Polling Trigger');
    } catch (e) {
      this.logger.error('Unexpected error while processing Polling Trigger call for cfg: %j', cfg, e);
      throw e;
    }
  }
}

async function processTrigger(msg, cfg, snapshot) {
  const client = new Client(this.logger, cfg);
  const trigger = new OneDrivePollingTrigger(this.logger, this, client);
  await trigger.process(cfg, snapshot);
}

exports.OneDrivePollingTrigger = OneDrivePollingTrigger;
module.exports.process = processTrigger;
exports.getDisks = require('../utils/metadataDrivesProcessor').getDisks;
exports.getFolderPaths = require('../utils/metadataDrivesProcessor').getFolderPaths;
