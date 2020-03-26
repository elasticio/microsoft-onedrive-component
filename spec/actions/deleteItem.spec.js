/* eslint-disable func-names */
const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const deleteItem = require('../../lib/actions/deleteItem');

const { expect } = chai;

const self = {
  emit: sinon.spy(),
  logger,
};

describe('deleteItem', () => {
  let cfg;
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

  it('delete file', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .delete(`/drives/${cfg.driveId}/root:/${msg.body.path}`)
      .reply(204);

    const result = await deleteItem.process.call(self, msg, cfg, {});
    const emitterCalls = self.emit.getCalls();
    expect(result.body).to.deep.equal({ path: msg.body.path });
    expect(emitterCalls.length).to.equal(0);
  });

  it('process file already not exists case', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .delete(`/drives/${cfg.driveId}/root:/${msg.body.path}`)
      .reply(404, {
        error: {
          code: 'itemNotFound',
          message: 'Item does not exist',
          innerError: {
            'request-id': 'b41fb9dd-70b1-4463-a1e1-904cb385e80d',
            date: '2020-03-06T10:47:34',
          },
        },
      });

    const result = await deleteItem.process.call(self, msg, cfg, {});
    const emitterCalls = self.emit.getCalls();
    expect(result.body).to.deep.equal({});
    expect(emitterCalls.length).to.equal(0);
  });
});
