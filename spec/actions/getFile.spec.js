const chai = require('chai');
// eslint-disable-next-line no-unused-vars
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

// eslint-disable-next-line no-unused-vars
const getFile = require('../../lib/actions/getFile');

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

  beforeEach(() => {
    cfg = {
      driveId: 'drive_id',
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

  afterEach(() => self.emit.resetHistory());

  before(() => {
    process.env.ELASTICIO_API_USERNAME = 'some_name';
    process.env.ELASTICIO_API_KEY = 'some_key';
  });

  it('get file', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/root:/${msg.body.path}:/content`)
      .reply(200, { file: 'content' });

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

    nock('https://api.elastic.io')
      .post('/v2/resources/storage/signed-url')
      .reply(200, {
        get_url: 'http://api-service/get_url',
        put_url: 'http://api-service/put_url',
      });

    nock('http://api-service')
      .put('/put_url')
      .reply(200, 'OK');

    const result = await getFile.process.call(self, msg, cfg);

    const emitterCalls = self.emit.getCalls();
    expect(result.body).to.deep.equal({
      '@odata.context': "https://graph.microsoft.com/v1.0/$metadata#drives('drive_id')/root/$entity",
      attachment: {
        'content-type': 'text/plain',
        size: 123,
        url: 'http://api-service/put_url',
      },
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
        url: 'http://api-service/put_url',
      },
    });
    expect(emitterCalls.length).to.equal(0);
  });

  it('process file not exists case', async () => {
  });
});
