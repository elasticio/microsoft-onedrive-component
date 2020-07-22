/* eslint-disable max-len */
const chai = require('chai');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
require('dotenv').config();

const pollingTrigger = require('../../lib/triggers/pollingTrigger');

const { expect } = chai;
const cfg = {
  oauth2: {
    token_type: 'Bearer',
    scope: 'Files.ReadWrite.All',
    expires_in: 3600,
    ext_expires_in: 3600,
    tokenExpiryTime: new Date(new Date().getTime() + 10000),
    client_id: process.env.OAUTH_CLIENT_ID,
    client_secret: process.env.OAUTH_CLIENT_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    token_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
  driveId: process.env.DRIVE_ID,
};
const emit = sinon.spy();
const self = {
  emit,
  logger,
};
describe('Microsoft OneDrive Polling Trigger Test', () => {
  let attachmentProcessorStub;

  beforeEach(() => {
    attachmentProcessorStub = sinon.stub(AttachmentProcessor.prototype, 'uploadAttachment');
    attachmentProcessorStub.returns({ config: { url: 'https://url' } });
  });

  afterEach(() => {
    attachmentProcessorStub.restore();
    emit.resetHistory();
  });

  it('should success fetchAll', async () => {
    cfg.emitBehaviour = 'fetchAll';
    cfg.itemId = '7161FC17AF0D3CE4!139';
    cfg.attachFile = true;
    await pollingTrigger.process.call(self, {}, cfg, {});
    expect(emit.getCalls().filter((c) => c.args[0] === 'data').length).to.equal(1);
  });

  it('should success emitIndividually', async () => {
    cfg.emitBehaviour = 'emitIndividually';
    cfg.itemId = '7161FC17AF0D3CE4!139';
    cfg.attachFile = true;
    cfg.expandChildren = true;
    await pollingTrigger.process.call(self, {}, cfg, {});
    expect(emit.getCalls().filter((c) => c.args[0] === 'data').length).to.equal(7);
  });

  it('should be able to retrieve many files', async () => {
    cfg.emitBehaviour = 'emitIndividually';
    cfg.itemId = '7161FC17AF0D3CE4!218';
    cfg.attachFile = false;
    cfg.expandChildren = true;
    await pollingTrigger.process.call(self, {}, cfg, {});
    expect(emit.getCalls().filter((c) => c.args[0] === 'data').length).to.equal(1000);
  });
});
