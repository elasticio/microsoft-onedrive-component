/* eslint-disable no-unused-vars */
const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

// eslint-disable-next-line no-unused-vars
const getFile = require('../../lib/actions/getFile');
const { Client } = require('../../lib/client');

// eslint-disable-next-line no-unused-vars
const { expect } = chai;

const self = {
  emit: sinon.spy(),
  logger,
  AttachmentProcessor: {},
};

describe('get File', () => {
  // eslint-disable-next-line no-unused-vars
  let cfg;
  // eslint-disable-next-line no-unused-vars
  let msg;
  const maesterUri = 'http://ma.esrt';

  beforeEach(() => {
    cfg = {
      driveId: 'drive_id',
      attachFile: true,
      oauth2: {
        token_type: 'Bearer',
        scope: 'Files.ReadWrite.All',
        expires_in: 3600,
        ext_expires_in: 3600,
        tokenExpiryTime: new Date(new Date().getTime() + 10000),
        access_token: 'SOME_TOKEN',
      },
    };
    msg = {
      body: {
        path: 'path/to/file.any',
      },
    };
  });

  afterEach(() => {
    sinon.restore();
    self.emit.resetHistory();
  });

  before(() => {
    process.env.ELASTICIO_API_USERNAME = 'some_name';
    process.env.ELASTICIO_API_KEY = 'some_key';
    process.env.ELASTICIO_API_KEY = 'some_key';
    process.env.ELASTICIO_OBJECT_STORAGE_URI = maesterUri;
  });

  it('get file', async () => {
    const getFileMetadataStub = sinon.stub(Client.prototype, 'getFileMetadata').returns({
      '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#drives('drive_id')/root/$entity",
      createdDateTime: '2020-03-04T14:41:33.073Z',
      id: '549662B6F880DEF3!116',
      lastModifiedDateTime: '2020-03-05T14:09:22.24Z',
      size: 123,
      name: 'file.any',
      file: {
        mimeType: 'text/plain',
      },
    });
    const downloadFile = sinon.stub(Client.prototype, 'downloadFile').returns({ file: 'content' });
    const uploadAttachmentStub = sinon.stub(AttachmentProcessor.prototype, 'uploadAttachment').returns({ config: { url: 'https://url/' }, data: { objectId: 'id' } });

    const result = await getFile.process.call(self, msg, cfg);

    expect(result.body).to.deep.equal({
      '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#drives('drive_id')/root/$entity",
      size: 123,
      file: {
        mimeType: 'text/plain',
      },
      createdDateTime: '2020-03-04T14:41:33.073Z',
      id: '549662B6F880DEF3!116',
      lastModifiedDateTime: '2020-03-05T14:09:22.24Z',
      name: 'file.any',
    });
    expect(result.attachments).to.deep.equal({
      'file.any': {
        'content-type': 'text/plain',
        size: 123,
        url: 'https://url/id?storage_type=maester',
      },
    });
    expect(getFileMetadataStub.callCount).to.be.equal(1);
    expect(downloadFile.callCount).to.be.equal(1);
    expect(uploadAttachmentStub.callCount).to.be.equal(1);
    const emitterCalls = self.emit.getCalls();
    expect(emitterCalls.length).to.equal(0);
  });

  it('get file no attachment', async () => {
    cfg.attachFile = false;
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/root:/${msg.body.path}`)
      .reply(200, {
        '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#drives('drive_id')/root/$entity",
        createdDateTime: '2020-03-04T14:41:33.073Z',
        id: '549662B6F880DEF3!116',
        lastModifiedDateTime: '2020-03-05T14:09:22.24Z',
        size: 123,
        name: 'file.any',
        file: {
          mimeType: 'text/plain',
        },
      });

    const result = await getFile.process.call(self, msg, cfg);

    const emitterCalls = self.emit.getCalls();
    expect(result.body).to.deep.equal({
      '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#drives('drive_id')/root/$entity",
      size: 123,
      file: {
        mimeType: 'text/plain',
      },
      createdDateTime: '2020-03-04T14:41:33.073Z',
      id: '549662B6F880DEF3!116',
      lastModifiedDateTime: '2020-03-05T14:09:22.24Z',
      name: 'file.any',
    });
    expect(result.attachments).to.deep.equal({});
    expect(emitterCalls.length).to.equal(0);
  });

  it('process file not exists case', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/root:/${msg.body.path}`)
      .reply(404, {
        error: {
          code: 'itemNotFound',
          message: 'Item does not exist',
          innerError: {
            'request-id': 'abde8d63-49db-4753-99bb-c1ea3b1a47bf',
            date: '2020-03-23T10:55:18',
          },
        },
      });

    try {
      await getFile.process.call(self, msg, cfg);
    } catch (err) {
      expect(err.data.error.code).to.equal('itemNotFound');
    }
  });
});
