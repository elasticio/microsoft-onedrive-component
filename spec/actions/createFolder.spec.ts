import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/OneDriveClient';
import { processAction } from '../../src/actions/createFolder';

chai.use(require('chai-as-promised'));

const fakeResponse: any = {};

describe('"Create Folder" action', () => {
  let execRequest;
  describe('should Create Folder', () => {
    beforeEach(() => {
    });
    afterEach(() => {
      sinon.restore();
    });
    it('successes', async () => {
      const cfg = { conflictBehavior: 'fail' };
      const msg = { body: { path: '/1', name: 'uno' } };
      execRequest = sinon.stub(Client.prototype, 'createFolder').callsFake(async () => fakeResponse);
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse);
      expect(execRequest.getCall(0).args).to.be.deep.equal([msg.body.path, msg.body.name, cfg.conflictBehavior]);
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'getFileMetadata').callsFake(async () => { throw new StatusCodeError(404); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it("Name shouldn't be empty", async () => {
      const cfg = {};
      const msg = { body: {} };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith("Name shouldn't be empty");
      expect(execRequest.callCount).to.be.equal(0);
    });
  });
});
