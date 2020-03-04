const { OAuth2RestClient } = require('@elastic.io/component-commons-library');

/* eslint-disable-next-line no-unused-vars */
module.exports = async function verifyCredentials(cfg, cb) {
  this.logger.trace('Current credentials: %j', cfg);
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);

  const client = new OAuth2RestClient({ logger: this.logger }, cfg);
  const response = await client.makeRequest({
    url: 'https://graph.microsoft.com/v1.0/me/drives',
    method: 'GET',
    urlIsSegment: false,
  });

  if (response.value) {
    return { verified: true };
  }

  return { verified: false };
};
