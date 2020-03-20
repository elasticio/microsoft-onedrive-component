const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const upsertFile = require('../../lib/actions/upsertFile');

const { expect } = chai;

const self = {
  emit: sinon.spy(),
  logger,
};
const cfg = {
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
const msg = {
  attachments: {
    1: {
      url: 'http://example.com',
    },
  },
  body: {
    path: 'path/to/file.any',
  },
};

describe('Upsert File', () => {
  afterEach(() => self.emit.resetHistory());
  before(() => {
    process.env.ELASTICIO_API_USERNAME = 'some_name';
    process.env.ELASTICIO_API_KEY = 'some_key';
  });
  it('Returns response for uploaded file', async () => {
    nock('https://graph.microsoft.com:443', { encodedQueryParams: true })
      .put('/v1.0/drives/drive_id/root:/path/to/file.any:/content')
      .reply(201, {
        id: 1,
        name: 'file.any',
      });
    const result = await upsertFile.process.call(self, msg, cfg);
    expect(result.body.result.id).to.be.eql(1);
  });
  it('Fails if no attachments provided', async () => {
    try {
      await upsertFile.process.call(self, {
        body: {
          path: '/path/to/file.any',
        },
      }, cfg);
      expect('should fail on proocess call', true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Error: Attachment not found in message: {"body":{"path":"/path/to/file.any"}}');
    }
  });
});
