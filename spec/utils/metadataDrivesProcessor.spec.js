/* eslint-disable func-names */
const chai = require('chai');
const nock = require('nock');
const logger = require('@elastic.io/component-logger')();

const metadataDrivesProcessor = require('../../lib/utils/metadataDrivesProcessor');

const { expect } = chai;

const self = {
  logger,
};

describe('metadataDrivesProcessor', () => {
  let cfg;

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
  });

  it('get drives metadata', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .get('/me/drives')
      .reply(200, {
        '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#drives',
        value: [
          {
            id: '2281488',
            driveType: 'personal',
            owner: {
              user: {
                displayName: 'Some Name',
                id: '2281488',
              },
            },
            quota: {
              deleted: 123,
              remaining: 123456,
              state: 'normal',
              total: 123456,
              used: 123,
            },
          },
        ],
      });

    const result = await metadataDrivesProcessor.getDisks.call(self, cfg);
    expect(result).to.deep.equal({ 2281488: 'Some Name' });
  });
});
