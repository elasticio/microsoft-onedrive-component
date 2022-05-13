const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

const { expect } = chai;
const pollingTrigger = require('../../lib/triggers/pollingTrigger');

const txtFileName = 'level2_file1.txt';
const txtFileId = 'txt_file_id';
const pngFileName = 'level2_file2.png';
const pngFileId = 'png_file_id';
const childFolderId = 'child_folder_id';
const childTxtName = 'childTxtName';
const childTxtId = 'child_txt_id';
const childLastModifiedDateTime = '2020-03-24T17:16:16.893Z';
const childObjects = {
  '@odata.count': 1,
  value: [
    {
      id: childTxtId,
      lastModifiedDateTime: childLastModifiedDateTime,
      name: childTxtName,
      size: 28,
      file: {
        mimeType: 'text/plain',
      },
    },
  ],
};
const allObjects = {
  '@odata.count': 3,
  value: [
    {
      id: txtFileId,
      lastModifiedDateTime: '2020-03-20T17:16:16.893Z',
      name: txtFileName,
      size: 28,
      file: {
        mimeType: 'text/plain',
      },
    },
    {
      id: pngFileId,
      lastModifiedDateTime: '2020-03-23T17:16:32.27Z',
      name: pngFileName,
      size: 29452,
      file: {
        mimeType: 'image/png',
      },
    },
    {
      id: childFolderId,
      lastModifiedDateTime: '2020-03-23T18:06:46.82Z',
      name: 'level2_folder1',
      folder: {
        childCount: 2,
      },
    },
  ],
};
const self = {
  emit: sinon.spy(),
  logger,
  AttachmentProcessor: {},
};

describe('pollingTrigger unit tests', () => {
  const cfg = {
    driveId: 'drive_id',
    itemId: 'item_id',
    oauth2: {
      token_type: 'Bearer',
      scope: 'Files.ReadWrite.All',
      expires_in: 3600,
      ext_expires_in: 3600,
      tokenExpiryTime: new Date(new Date().getTime() + 10000),
      access_token: 'SOME_TOKEN',
    },
  };
  let uploadAttachment;

  beforeEach(() => {
    uploadAttachment = sinon.stub(AttachmentProcessor.prototype, 'uploadAttachment').resolves({ config: { url: 'some_url/' }, data: { objectId: 'id' } });
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/items/${cfg.itemId}/children`)
      .reply(200, allObjects);
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/items/${childFolderId}/children`)
      .reply(200, childObjects);
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/items/${txtFileId}/content`)
      .reply(200, { file: 'content' });
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/items/${pngFileId}/content`)
      .reply(200, { file: 'content' });
  });

  afterEach(() => {
    self.emit.resetHistory();
    uploadAttachment.restore();
    nock.cleanAll();
  });

  it('emitIndividually with attachments without children', async () => {
    cfg.emitBehaviour = 'emitIndividually';
    cfg.attachFile = true;
    await pollingTrigger.process.call(self, {}, cfg, {});

    const emitterCalls = self.emit.getCalls();
    expect(emitterCalls.length).to.equal(3);
    // check Data emitter
    const emitterDataCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'data');
    expect(emitterDataCalls.length).to.equal(2);
    // check txtFile
    const txtFiles = emitterDataCalls.filter((emitterCall) => emitterCall.args[1].body.name === txtFileName);
    expect(txtFiles.length).to.equal(1);
    const txtFile = txtFiles[0].args[1];
    expect(txtFile.body).to.deep.equal(allObjects.value[0]);
    expect(txtFile.attachments[txtFileName]).to.deep.equal({
      url: 'some_url/id?storage_type=maester',
      size: allObjects.value[0].size,
      'content-type': allObjects.value[0].file.mimeType,
    });
    // check pngFile
    const pngFile = emitterDataCalls.filter((emitterCall) => emitterCall.args[1].body.name === pngFileName);
    expect(pngFile.length).to.equal(1);
    // check snapshot
    const emitterSnapshotCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'snapshot');
    expect(emitterSnapshotCalls.length).to.equal(1);
    const snapshot = emitterSnapshotCalls[0].args[1];
    expect(snapshot).to.deep.equal({
      startTime: '2020-03-23T17:16:32.27Z',
      filterOperator: 'gt',
    });
  });

  it('emitAll without attachments with children', async () => {
    cfg.emitBehaviour = 'fetchAll';
    cfg.expandChildren = true;
    cfg.attachFile = false;

    await pollingTrigger.process.call(self, {}, cfg, {});

    const emitterCalls = self.emit.getCalls();
    expect(emitterCalls.length).to.equal(2);
    // check Data emitter
    const emitterDataCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'data');
    expect(emitterDataCalls.length).to.equal(1);
    // check emittedMessage
    const emittedMessage = emitterDataCalls[0].args[1];
    expect(emittedMessage.attachments).to.deep.equal({});
    const { results } = emittedMessage.body;
    expect(results.length).to.equal(3);
    // check childTxtFile
    const resultsNames = results.map((result) => result.name);
    expect(resultsNames).to.have.deep.members([childTxtName, txtFileName, pngFileName]);
    // check snapshot
    const emitterSnapshotCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'snapshot');
    expect(emitterSnapshotCalls.length).to.equal(1);
    const snapshot = emitterSnapshotCalls[0].args[1];
    expect(snapshot).to.deep.equal({
      startTime: childLastModifiedDateTime,
      filterOperator: 'gt',
    });
  });

  it('emitAll without attachments with children and pageSize', async () => {
    cfg.emitBehaviour = 'fetchAll';
    cfg.expandChildren = true;
    cfg.pageSize = 2;
    cfg.attachFile = true;

    await pollingTrigger.process.call(self, {}, cfg, {});

    const emitterCalls = self.emit.getCalls();
    expect(emitterCalls.length).to.equal(2);
    // check Data emitter
    const emitterDataCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'data');
    expect(emitterDataCalls.length).to.equal(1);
    // check emittedMessage
    const emittedMessage = emitterDataCalls[0].args[1];
    expect(emittedMessage.attachments[txtFileName]).to.deep.equal({
      url: 'some_url/id?storage_type=maester',
      size: allObjects.value[0].size,
      'content-type': allObjects.value[0].file.mimeType,
    });
    const { results } = emittedMessage.body;
    expect(results.length).to.equal(2);
    // check childTxtFile
    const resultsNames = results.map((result) => result.name);
    expect(resultsNames).to.have.deep.members([txtFileName, pngFileName]);
    // check snapshot
    const emitterSnapshotCalls = emitterCalls.filter((emitterCall) => emitterCall.args[0] === 'snapshot');
    expect(emitterSnapshotCalls.length).to.equal(1);
    const snapshot = emitterSnapshotCalls[0].args[1];
    expect(snapshot).to.deep.equal({
      startTime: childLastModifiedDateTime,
    });
  });
});
