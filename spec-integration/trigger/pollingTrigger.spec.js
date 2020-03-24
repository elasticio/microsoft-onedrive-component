/* eslint-disable max-len */
const chai = require('chai');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();
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
  it('should success fetchAll', async () => {
    cfg.emitBehaviour = 'fetchAll';
    cfg.itemId = 'root';
    cfg.attachFile = true;
    await pollingTrigger.process.call(self, {}, cfg, {});
    expect(emit.callCount).to.equal(2);
  });

  it('should success emitIndividually', async () => {
    cfg.emitBehaviour = 'emitIndividually';
    cfg.itemId = 'root';
    cfg.attachFile = true;
    await pollingTrigger.process.call(self, {}, cfg, {});
    expect(emit.callCount).to.equal(2);
  });
});
