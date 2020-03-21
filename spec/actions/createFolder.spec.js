const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const createFolder = require('../../lib/actions/createFolder');

const { expect } = chai;

const self = {
  emit: sinon.spy(),
  logger,
};
const cfg = {
  driveId: 'drive_id',
  conflictBehaviour: 'fail',
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
  body: {
    path: '/base/inner',
    name: 'test',
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
      .get('/v1.0/drives/drive_id/root://base/inner')
      .reply(200, { id: 1 });
    nock('https://graph.microsoft.com:443', { encodedQueryParams: true })
      .post('/v1.0/drives/drive_id/items/1/children', { name: 'test', folder: {}, '@microsoft.graph.conflictBehavior': 'fail' })
      .reply(200, { id: 2, name: 'test' });
    const result = await createFolder.process.call(self, msg, cfg);
    expect(result.body.result).to.be.eql({
      id: 2,
      name: 'test',
    });
  });
  it('Fails if no attachments provided', async () => {
    try {
      nock('https://graph.microsoft.com:443', { encodedQueryParams: true })
        .get('/v1.0/drives/drive_id/root://base/inner')
        .reply(404);
      await createFolder.process.call(self, msg, cfg);
      expect('should fail on proocess call', true).to.be.false;
    } catch (e) {
      expect(e.message).to.be.eql('Error: Path: "/base/inner" is not exist in drive: drive_id');
    }
  });
});
