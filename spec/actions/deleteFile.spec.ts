import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/OneDriveClient';
import { processAction } from '../../src/actions/deleteFile';

chai.use(require('chai-as-promised'));

const fakeResponse: any = { };

describe('"Delete File" action', () => {
  let execRequest;
  describe('should Delete File', () => {
    beforeEach(() => {
    });
    afterEach(() => {
      sinon.restore();
    });
    it('successes', async () => {
      const cfg = { };
      const msg = { body: { path: '/1' } };
      const context = getContext();
      execRequest = sinon.stub(Client.prototype, 'deleteItem').callsFake(async () => fakeResponse);
      await processAction.call(context, msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal({ path: msg.body.path });
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(msg.body.path);
    });
    it('ifNotFound - emitNothing', async () => {
      const cfg = {
        ifNotFound: 'emitNothing'
      };
      const msg = { body: { path: '/1' } };
      const context = getContext();
      execRequest = sinon.stub(Client.prototype, 'deleteItem').callsFake(async () => { throw new StatusCodeError(404); });
      await processAction.call(context, msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.callCount).to.be.equal(0);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal(msg.body.path);
    });
    it('ifNotFound - emitEmpty', async () => {
      const cfg = {
        ifNotFound: 'emitEmpty'
      };
      const msg = { body: { path: '/1' } };
      const context = getContext();
      execRequest = sinon.stub(Client.prototype, 'deleteItem').callsFake(async () => { throw new StatusCodeError(404); });
      await processAction.call(context, msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal({});
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
    it('ifNotFound - throwError', async () => {
      const cfg = {
        ifNotFound: 'throwError'
      };
      const msg = { body: { path: '/1' } };
      const context = getContext();
      execRequest = sinon.stub(Client.prototype, 'deleteItem').callsFake(async () => { throw new StatusCodeError(404); });
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
