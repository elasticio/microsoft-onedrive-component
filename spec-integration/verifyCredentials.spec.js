/* eslint-disable max-len */
const chai = require('chai');
const logger = require('@elastic.io/component-logger')();
require('dotenv').config();

const verifyCredentials = require('../verifyCredentials');

const { expect } = chai;

describe('verifyCredentials unit', () => {
  let cfg;

  beforeEach(() => {
    cfg = {
      oauth2: {
        token_type: 'Bearer',
        scope: 'Files.ReadWrite.All',
        expires_in: 3600,
        ext_expires_in: 3600,
        tokenExpiryTime: new Date(new Date().getTime() + 10000),
        access_token: process.env.ACCESS_TOKEN,
      },
    };
  });

  it('should succeed on correct credentials', async () => {
    const result = await verifyCredentials.call({ logger }, cfg, (a) => a);
    expect(result).to.deep.equal({ verified: true });
  });

  it('should succeed on refresh token', async () => {
    cfg.oauth2.refresh_token = process.env.REFRESH_TOKEN;
    cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() - 10000);
    cfg.authorizationServerTokenEndpointUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    cfg.oauth2_field_client_id = process.env.CLIENT_ID;
    cfg.oauth2_field_client_secret = process.env.CLIENT_SECRET;

    const result = await verifyCredentials.call({ logger }, cfg, (a) => a);
    expect(result).to.deep.equal({ verified: true });
  });
});
