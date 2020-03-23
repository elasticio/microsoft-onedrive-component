/* eslint-disable max-len */
const chai = require('chai');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
require('dotenv').config();

const { Client } = require('../lib/client');

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
const client = new Client(logger, cfg);
describe('Microsoft OneDrive Client Test', () => {
  before(async () => {
    const testStream = fs.createReadStream('./spec-integration/resources/test.json');
    await client.uploadFile(
      '/download.json',
      testStream,
    );
    const imageStream = fs.createReadStream('./spec-integration/resources/test.png');
    await client.uploadFile(
      '/delete.png',
      imageStream,
    );
    // TODO create dynamicly base_folder/inner_folder and upload one file to this folders
    // this requires create folder method in client
  });
  it('should return my drives list', async () => {
    const result = await client.getMyDrives();
    expect(result[0].driveType).to.equal('personal');
  });

  it('should return drive children files', async () => {
    const result = await client.getChildrenFiles('/base_folder/inner_folder');
    expect(result.length > 0).to.equal(true);
    // eslint-disable-next-line no-prototype-builtins
    expect(result.filter((item) => item.hasOwnProperty('folder')).length).to.equal(0);
  });

  it('should return file metadata', async () => {
    cfg.driveId = process.env.DRIVE_ID;
    const result = await new Client(logger, cfg).getFileMetadata('/base_folder/inner_folder');
    expect(result.name).to.equal('inner_folder');
  });

  it('should upload file by provided name', async () => {
    const fileStream = fs.createReadStream('./spec-integration/resources/test.json');
    const result = await client.uploadFile(
      '/test.json',
      fileStream,
    );
    expect(result.name).to.be.eql('test.json');
  });

  it('should download file by provided name', async () => {
    const result = await client.downloadFile('/download.json');
    expect(result).to.exist;
  });

  it('should delete file by provided name', async () => {
    const result = await client.deleteItem('/delete.png');
    expect(result).to.be.eql('');
  });

  it('should check that file is exist provided name', async () => {
    const result = await client.isExist('/test.json');
    expect(result).to.exist;
  });
  it('should check that file is not exist provided name', async () => {
    const result = await client.isExist('/notExist.json');
    expect(result).to.be.false;
  });
});
