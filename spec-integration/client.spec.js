/* eslint-disable max-len */
const chai = require('chai');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
require('dotenv').config();

const { Client } = require('../lib/client');

const { expect } = chai;

describe('Microsoft OneDrive Client Test', () => {
  let cfg;

  beforeEach(() => {
    cfg = {
      oauth2: {
        token_type: 'Bearer',
        scope: 'Files.ReadWrite.All',
        expires_in: 3600,
        ext_expires_in: 3600,
        tokenExpiryTime: new Date(new Date().getTime() + 10000),
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        refresh_token: process.env.REFRESH_TOKEN,
        token_uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
      },
    };
  });

  it('should return my drives list', async () => {
    const result = await new Client(logger, cfg).getMyDrives();
    expect(result[0].driveType).to.equal('personal');
  });

  it('should return drive children files', async () => {
    cfg.driveId = process.env.DRIVE_ID;
    const result = await new Client(logger, cfg).getChildrenFiles('/base_folder/inner_folder');
    expect(result.length > 0).to.equal(true);
    // eslint-disable-next-line no-prototype-builtins
    expect(result.filter((item) => item.hasOwnProperty('folder')).length).to.equal(0);
  });

  it('should upload file by provided name', async () => {
    cfg.driveId = process.env.DRIVE_ID;
    const fileStream = fs.createReadStream('./verifyCredentials.js');

    const result = await new Client(logger, cfg).uploadFile(
      '/base_folder/inner_folder/verifyCredentials.js',
      fileStream,
    );
    expect(result).to.equal(undefined);
    // eslint-disable-next-line no-prototype-builtins
    expect(result.filter((item) => item.hasOwnProperty('folder')).length).to.equal(0);
  });

  it('should download file by provided name', async () => {
    cfg.driveId = process.env.DRIVE_ID;
    const client = new Client(logger, cfg);

    const result = await client.downloadFile('/base_folder/inner_folder/png.png');
    expect(result.length > 0).to.equal(true);
  });

  it('should delete file by provided name', async () => {
    cfg.driveId = process.env.DRIVE_ID;
    const result = await new Client(logger, cfg).deleteItem('/base_folder/inner_folder/test');
    expect(result).to.equal(undefined);
  });
});
