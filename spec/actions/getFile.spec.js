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

  it('get file', async () => {
  });

  it('process file not exists case', async () => {
  });
});
