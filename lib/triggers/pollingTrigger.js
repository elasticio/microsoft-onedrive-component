/* eslint-disable no-param-reassign */
const {
  MIN_DATE, MAX_DATE, EMIT_INDIVIDUALLY, FETCH_ALL,
} = require('@elastic.io/oih-standard-library/lib/constants');
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { PollingTrigger } = require('@elastic.io/oih-standard-library/lib/triggers/getNewAndUpdated');
const { messages } = require('elasticio-node');
const mapLimit = require('async/mapLimit');
const { Client } = require('../client');

class OneDrivePollingTrigger extends PollingTrigger {
  constructor(logger, emitter, client) {
    super(logger, emitter);
    this.client = client;
    this.attachmentsProcessor = new AttachmentProcessor();
  }

  async emitAll(resultFiles) {
    const message = messages.newMessageWithBody({ results: resultFiles });
    await mapLimit(resultFiles, 20, async (file) => {
      if (this.client.cfg.attachFile) {
        const attachment = await this.client.downloadFileByItemId(file.id);
        const attachmentResult = await this.attachmentsProcessor.uploadAttachment(attachment);
        message.attachments[file.name] = {
          url: attachmentResult.config.url,
          size: file.size,
          'content-type': file.file.mimeType,

        };
      }
    });
    this.logger.debug('Emitting new message...');
    await this.context.emit('data', message);
    this.logger.debug('Finished emitting data');
  }

  async emitIndividually(resultFiles) {
    await mapLimit(resultFiles, 1, async (file) => {
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
      this.logger.debug('Emitting new message...');
      await this.context.emit('data', message);
      this.logger.debug('Finished emitting data');
    });
  }

  async getObjects(itemId, startTime, endTime, filterOperator) {
    let params;
    if (startTime && Date.parse(startTime) && Date.parse(startTime) !== MIN_DATE) {
      params = `?$filter=lastModifiedDateTime ${filterOperator || 'ge'} ${startTime}`;
    }
    if (endTime && Date.parse(endTime) && Date.parse(endTime) !== MAX_DATE) {
      params = params ? `${params} and lastModifiedDateTime lt ${endTime}` : `?$filter=lastModifiedDateTime lt ${endTime}`;
    }
    return this.client.getChildren(itemId, params);
  }

  async getChildesFiles(items, startTime, endTime, files, filterOperator) {
    const folders = items.filter((item) => Object.prototype.hasOwnProperty.call(item, 'folder'));
    await mapLimit(folders, 20, async (folder) => {
      const result = await this.getObjects(folder.id, startTime, endTime, filterOperator);
      const childesFiles = result.filter((item) => !Object.prototype.hasOwnProperty.call(item, 'folder'));
      files.push(...childesFiles);
      await this.getChildesFiles(result, startTime, endTime, files, filterOperator);
    });
  }

  async process(cfg, snapshot) {
    try {
      this.logger.info('Starting processing Polling trigger');
      const { itemId, expandChildren } = cfg;
      const startTime = this.getStartTime(cfg, snapshot);
      const endTime = this.getEndTime(cfg);
      this.logger.debug('Start object polling');
      const allObjects = await this.getObjects(itemId, startTime, endTime, snapshot.filterOperator);
      this.logger.debug('Finish object polling');
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
      files.sort((a, b) => (new Date(a.lastModifiedDateTime) > new Date(b.lastModifiedDateTime) ? 1 : -1));
      let resultFiles;
      const pageSize = this.getSizeOfPollingPage(cfg);
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
        await this.emitIndividually(resultFiles);
      } else if (emitBehaviour === FETCH_ALL) {
        await this.emitAll(resultFiles);
      }
      this.logger.debug('Start emitting snapshot');
      this.context.emit('snapshot', snapshot);
      this.logger.debug('Finish emitting snapshot');
      this.logger.info('Finished processing call to Polling Trigger');
    } catch (e) {
      this.logger.error('Unexpected error while processing Polling Trigger call');
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
