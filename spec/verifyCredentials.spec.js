/* eslint-disable max-len */
const chai = require('chai');
const logger = require('@elastic.io/component-logger')();
const verifyCredentials = require('../verifyCredentials');

const { expect } = chai;

describe('verifyCredentials unit', () => {
  const cfg = {

  };

  it('should succeed on correct credentials', async () => {
    const result = await verifyCredentials.call({ logger }, cfg, (a) => a);
    expect(result).to.deep.equal({ verified: true });
  });
});
