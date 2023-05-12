/* eslint-disable max-len */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/OneDriveClient';
import { processTrigger } from '../../src/triggers/getNewAndUpdatedObjectsPolling';

chai.use(require('chai-as-promised'));

const fakeResponse: any = {
  value: [
    {
      createdDateTime: '2023-05-10T10:07:42Z',
      lastModifiedDateTime: '2023-05-10T10:07:42Z',
      name: 'asd',
      folder: {
        childCount: 0
      }
    },
    {
      createdDateTime: '2023-05-10T10:07:42Z',
      lastModifiedDateTime: '2023-05-10T10:07:42Z',
      name: 'asd',
      file: {
        mimeType: 'text/plain',
      }
    }
  ]
};

describe('"Get New and Updated Objects" trigger', () => {
  let execRequest;
  describe('success', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'getChildren').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('emitIndividually', async () => {
      const cfg = {
        emitBehavior: 'emitIndividually',
        startTime: '',
        endTime: '',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: ['/1']
      };
      const context = getContext();
      await processTrigger.call(context, {}, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal(fakeResponse.value[1]);
      expect(execRequest.getCall(0).args).to.be.deep.equal([cfg.path[0], undefined, 2]);
    });
    it('emitPage', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: '',
        endTime: '',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: ['/1']
      };
      const context = getContext();
      await processTrigger.call(context, {}, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(context.emit.getCall(0).args[1].body).to.be.deep.equal({ results: [fakeResponse.value[1]] });
      expect(execRequest.getCall(0).args).to.be.deep.equal([cfg.path[0], undefined, 2]);
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'getFileMetadata').callsFake(async () => { throw new StatusCodeError(404); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('Select at least one folder to follow', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: '',
        endTime: '',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: []
      };
      const context = getContext();
      await expect(processTrigger.call(context, {}, cfg))
        .to.be.rejectedWith('Select at least one folder to follow');
      expect(context.emit.callCount).to.be.equal(0);
    });
    it('invalid "Start Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: 'invalid "Start Time"',
        endTime: '',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: ['/1']
      };
      const context = getContext();
      await expect(processTrigger.call(context, {}, cfg))
        .to.be.rejectedWith('invalid "Start Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
      expect(context.emit.callCount).to.be.equal(0);
    });
    it('invalid "End Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: '',
        endTime: 'invalid "End Time"',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: ['/1']
      };
      const context = getContext();
      await expect(processTrigger.call(context, {}, cfg))
        .to.be.rejectedWith('invalid "End Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
      expect(context.emit.callCount).to.be.equal(0);
    });
    it('"Size of Polling Page" must be valid number between 1 and 999', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: '',
        endTime: '',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 1000,
        path: ['/1']
      };
      const context = getContext();
      await expect(processTrigger.call(context, {}, cfg))
        .to.be.rejectedWith('"Size of Polling Page" must be valid number between 1 and 999');
      expect(context.emit.callCount).to.be.equal(0);
    });
    it('"Start Time" should be less or equal to "End Time"', async () => {
      const cfg = {
        emitBehavior: 'emitPage',
        startTime: '2023-05-10T10:07:42Z',
        endTime: '2023-01-10T10:07:42Z',
        pollConfig: 'lastModifiedDateTime',
        attachFile: false,
        includeSubfolders: false,
        pageSize: 2,
        path: ['/1']
      };
      const context = getContext();
      await expect(processTrigger.call(context, {}, cfg))
        .to.be.rejectedWith('"Start Time" should be less or equal to "End Time"');
      expect(context.emit.callCount).to.be.equal(0);
    });
  });
});
