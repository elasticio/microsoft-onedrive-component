import chai, { expect } from 'chai';
import { AttachmentProcessor } from '@elastic.io/component-commons-library/dist/src/attachment/AttachmentProcessor';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/OneDriveClient';
import { processAction } from '../../src/actions/lookupObject';

chai.use(require('chai-as-promised'));

const fakeResponse: any = { name: '1.txt' };

describe('"Get File" action', () => {
  let execRequest;
  describe('should Get File', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'getFileMetadata').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('attachFile - false', async () => {
      const cfg = {
        attachFile: false
      };
      const msg = { body: { path: '/1' } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(msg.body.path);
    });
    it('attachFile - true', async () => {
      const cfg = {
        attachFile: true
      };
      sinon.stub(AttachmentProcessor.prototype, 'uploadAttachment').callsFake(async () => fakeResponse);
      sinon.stub(AttachmentProcessor.prototype, 'getMaesterAttachmentUrlById').callsFake(() => 'url');
      const msg = { body: { path: '/1' } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal({ name: '1.txt', attachmentUrl: 'url' });
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(msg.body.path);
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'getFileMetadata').callsFake(async () => { throw new StatusCodeError(404); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Can't find file with provided path", async () => {
      const cfg = { };
      const msg = { body: { path: '/1' } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith("Can't find file with provided path");
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(msg.body.path);
    });
    it("Path shouldn't be empty", async () => {
      const cfg = {
        objectType: 'users'
      };
      const msg = { body: { } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith("Path shouldn't be empty");
      expect(execRequest.callCount).to.be.equal(0);
    });
  });
});
