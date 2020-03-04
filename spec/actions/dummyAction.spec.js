/* eslint-disable max-len */
const chai = require('chai');
const sinon = require('sinon');
const logger = require('@elastic.io/component-logger')();

const dummyAction = require('../../lib/actions/dummyAction');

const { expect } = chai;

let self;

describe('dummyAction test', () => {
  beforeEach(() => {
    self = {
      emit: sinon.spy(),
      logger,
    };
  });

  const msg = {
    body: {
      data: 'ok',
    },
  };

  const cfg = {

  };

  it('should succeed', async () => {
    await dummyAction.process.call(self, msg, cfg);
    const emitterCalls = self.emit.getCalls();
    expect(emitterCalls[0].args[1].body).to.deep.equal({ data: 'ok' });
  });
});
