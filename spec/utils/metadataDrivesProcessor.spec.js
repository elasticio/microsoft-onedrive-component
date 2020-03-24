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

  it('getFolderPaths SelectView model', async () => {
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/root/children`)
      .reply(200, {
        value: [
          {
            id: 'testPollId',
            name: 'testPoll',
            parentReference: {
              path: '/drive/root:',
            },
            folder: {
              childCount: 2,
            },
          },
        ],
      });
    nock('https://graph.microsoft.com/v1.0')
      .get(`/drives/${cfg.driveId}/items/testPollId/children`)
      .reply(200, {
        value:
          [
            {
              '@microsoft.graph.downloadUrl': 'https://public.dm.files.1drv.com/y4mD4El4CM9PtoJCRnK_qDtYKzgZK7EsqLL6Xu5GDrYFgwxuRQFNZwCj9OA6OE1U',
              createdDateTime: '2020-03-18T11:54:51.927Z',
              id: '7943C5FF426D58A3!82611',
              lastModifiedDateTime: '2020-03-18T11:54:53.273Z',
              name: '3.png',
              size: 36422,
            },
            {
              '@microsoft.graph.downloadUrl': 'https://public.dm.files.1drv.com/y4muXR93hClM8Bczw6aw-El8',
              createdDateTime: '2020-03-18T11:54:51.75Z',
              id: '7943C5FF426D58A3!82610',
              lastModifiedDateTime: '2020-03-18T11:54:52.55Z',
              name: '4.png',
              size: 37148,
            },
          ],
      });

    const result = await metadataDrivesProcessor.getFolderPaths.call(self, cfg);
    expect(result).to.deep.equal({
      testPollId: '/drive/root:/testPoll',
      root: '/drive/root',
    });
  });
});
