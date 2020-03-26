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
  conflictBehaviour: 'replace',
};
const client = new Client(logger, cfg);
let downloadedFile;
describe('Microsoft OneDrive Client Test', () => {
  before(async () => {
    const testStream = fs.createReadStream('./spec-integration/resources/test.json');
    downloadedFile = await client.uploadFile(
      '/download.json',
      testStream,
    );
    const imageStream = fs.createReadStream('./spec-integration/resources/test.png');
    await client.uploadFile(
      '/delete.png',
      imageStream,
    );
    const baseFolder = await client.createFolder('root', 'base_folder');
    await client.createFolder(baseFolder.id, 'inner_folder');
  });
  it('should return my drives list', async () => {
    const result = await client.gegetChildrentMyDrives();
    expect(result[0].driveType).to.equal('personal');
  });

  it('should return drive children files', async () => {
    const result = await client.getChildrenFiles('');
    expect(result.length > 0).to.equal(true);
    expect(result.filter((item) => Object.prototype.hasOwnProperty.call(item, 'folder')).length).to.equal(0);
  });

  it('should return drive all children', async () => {
    const result = await client.getChildren('root');
    expect(result.length > 0).to.equal(true);
    const folderCount = result.filter((item) => Object.prototype.hasOwnProperty.call(item, 'folder')).length;
    expect(folderCount > 0).to.equal(true);
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

  it('should download file by itemId', async () => {
    const result = await client.downloadFileByItemId(downloadedFile.id);
    expect(Object.prototype.hasOwnProperty.call(result, 'responseUrl')).to.equal(true);
    expect(result.responseUrl).to.contains(downloadedFile.name);
  });

  it('should delete file by provided name', async () => {
    const result = await client.deleteItem('/delete.png');
    expect(result).to.be.eql('');
  });

  it('should check that file is exist provided name', async () => {
    const result = await client.isExist('/test.json');
    expect(result).to.exist;
  });
  it('should return root for empty string and /', async () => {
    let result = await client.isExist('');
    expect(result).to.be.eql('root');
    result = await client.isExist('/');
    expect(result).to.be.eql('root');
  });
  it('should check that file is not exist provided name', async () => {
    const result = await client.isExist('/notExist.json');
    expect(result).to.be.false;
  });
  it('should create folder', async () => {
    const test = await client.createFolder('root', 'test');
    expect(test.name).to.be.eql('test');
  });
  it('should rename folder if it exists and conflictBehaviour=rename', async () => {
    client.cfg.conflictBehaviour = 'rename';
    const test1 = await client.createFolder('root', 'test1');
    const test2 = await client.createFolder('root', 'test1');
    expect(test1.name).to.not.be.eql(test2.name);
  });
  it('should fail if folder exists and conflictBehaviour=fail', async () => {
    try {
      client.cfg.conflictBehaviour = 'fail';
      await client.createFolder('root', 'test3');
      await client.createFolder('root', 'test3');
      expect('test shoulld fail earlier', true).to.be.false;
    } catch (e) {
      expect(e).to.exist;
    }
  });
});
