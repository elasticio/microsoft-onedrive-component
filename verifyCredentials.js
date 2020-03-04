const { Client } = require('./lib/client');

/* eslint-disable-next-line no-unused-vars */
module.exports = async function verifyCredentials(cfg, cb) {
  this.logger.trace('Current credentials: %j', cfg);
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);

  const client = new Client(this.logger, cfg);
  const response = await client.getMyDrives();

  if (response.length > 0) {
    return { verified: true };
  }

  return { verified: false };
};
