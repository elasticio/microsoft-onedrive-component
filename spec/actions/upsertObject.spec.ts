import chai, { expect } from 'chai';
import { AttachmentProcessor } from '@elastic.io/component-commons-library/dist/src/attachment/AttachmentProcessor';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/OneDriveClient';
import { processAction } from '../../src/actions/upsertObject';

chai.use(require('chai-as-promised'));

const fakeCreateUploadSessionResponse: any = { uploadUrl: 'some url' };
const fakeUploadLargeFile: any = { result: 'some url' };
const fakeGetAttachment: any = { uploadUrl: 'some url' };

describe('"Upsert File" action', () => {
  let execRequest;
  describe('should Upsert File', () => {
    beforeEach(() => {
      sinon.stub(AttachmentProcessor.prototype, 'getAttachment').callsFake(async () => fakeGetAttachment);
      sinon.stub(Client.prototype, 'createUploadSession').callsFake(async () => fakeCreateUploadSessionResponse);
      execRequest = sinon.stub(Client.prototype, 'uploadLargeFile').callsFake(async () => fakeUploadLargeFile);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('successes', async () => {
      const cfg = {};
      const msg = { body: { files: [{ url: 'some url', path: '/1' }] } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal([fakeUploadLargeFile]);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(fakeCreateUploadSessionResponse.uploadUrl);
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      sinon.stub(AttachmentProcessor.prototype, 'getAttachment').callsFake(async () => fakeGetAttachment);
      sinon.stub(Client.prototype, 'createUploadSession').callsFake(async () => fakeCreateUploadSessionResponse);
      execRequest = sinon.stub(Client.prototype, 'uploadLargeFile').callsFake(async () => fakeUploadLargeFile);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('"Files" must be an array with records', async () => {
      const cfg = {};
      const msg = { body: { files: '' } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('"Files" must be an array with records');
    });
    it("URL and path shouldn't be empty", async () => {
      const cfg = {};
      const msg = { body: { files: [{ path: '/1' }] } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith("URL and path shouldn't be empty");
      expect(execRequest.callCount).to.be.equal(0);
    });
  });
});
