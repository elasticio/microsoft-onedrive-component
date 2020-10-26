const { Client } = require('./lib/client');

module.exports = async function verifyCredentials(cfg) {
  this.logger.trace('Starting verify credentials...');
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);

  const client = new Client(this.logger, cfg);
  const response = await client.getMyDrives();

  if (response.length > 0) {
    return { verified: true };
  }

  return { verified: false };
};
