const { Client } = require('../client');

exports.getDisks = async function (cfg) {
  this.logger.trace('Current credentials: %j', cfg);
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);
  const client = new Client(this.logger, cfg);
  const drives = await client.getMyDrives();
  const drivesMeta = {};
  // eslint-disable-next-line no-return-assign
  drives.forEach((drive) => drivesMeta[drive.id] = drive.owner.user.displayName);
  return drivesMeta;
};
